package com.diploma.spp.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.diploma.spp.dto.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Repository
public class AnalyticsRepository {

    private final JdbcClient jdbc;

    public AnalyticsRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // ── Revenue ──────────────────────────────────────────────────────────────

    public List<RevenueDayDto> getRevenue(Long specialistProfileId, LocalDate from, LocalDate to) {
        String sql = """
            WITH date_series AS (
                SELECT generate_series(:from::date, :to::date, '1 day'::interval)::date AS day
            ),
            agg AS (
                SELECT date_trunc('day', ts.slot_date)::date AS day,
                       COALESCE(SUM(svc.price), 0)  AS amount,
                       COUNT(b.id)                  AS cnt
                FROM   bookings b
                JOIN   services svc  ON svc.id = b.service_id
                JOIN   time_slots ts ON ts.id = b.time_slot_id
                WHERE  svc.specialist_id = :profileId
                  AND  b.status IN ('CONFIRMED','COMPLETED')
                  AND  ts.slot_date BETWEEN :from AND :to
                GROUP BY 1
            )
            SELECT ds.day, COALESCE(a.amount, 0) AS amount, COALESCE(a.cnt, 0) AS cnt
            FROM   date_series ds
            LEFT JOIN agg a ON a.day = ds.day
            ORDER BY ds.day
            """;

        return jdbc.sql(sql)
                .param("profileId", specialistProfileId)
                .param("from", from)
                .param("to", to)
                .query((rs, n) -> new RevenueDayDto(
                        rs.getObject("day", LocalDate.class),
                        rs.getBigDecimal("amount"),
                        rs.getLong("cnt")))
                .list();
    }

    // ── Workload ─────────────────────────────────────────────────────────────

    public List<WorkloadDayDto> getWorkload(Long specialistProfileId, LocalDate from, LocalDate to) {
        String sql = """
            WITH date_series AS (
                SELECT generate_series(:from::date, :to::date, '1 day'::interval)::date AS day
            ),
            agg AS (
                SELECT slot_date AS day,
                       COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE status IN ('BOOKED','CANCELLED')) AS booked
                FROM   time_slots
                WHERE  specialist_id = :profileId
                  AND  slot_date BETWEEN :from AND :to
                GROUP BY 1
            )
            SELECT ds.day,
                   COALESCE(a.total, 0)  AS total,
                   COALESCE(a.booked, 0) AS booked
            FROM   date_series ds
            LEFT JOIN agg a ON a.day = ds.day
            ORDER BY ds.day
            """;

        return jdbc.sql(sql)
                .param("profileId", specialistProfileId)
                .param("from", from)
                .param("to", to)
                .query((rs, n) -> {
                    long total = rs.getLong("total");
                    long booked = rs.getLong("booked");
                    double pct = total > 0 ? (booked * 100.0 / total) : 0.0;
                    return new WorkloadDayDto(
                            rs.getObject("day", LocalDate.class),
                            total, booked,
                            Math.round(pct * 10.0) / 10.0);
                })
                .list();
    }

    // ── Rating history ────────────────────────────────────────────────────────

    public List<RatingDayDto> getRatingHistory(Long specialistProfileId, LocalDate from, LocalDate to) {
        String sql = """
            WITH date_series AS (
                SELECT generate_series(:from::date, :to::date, '1 day'::interval)::date AS day
            ),
            agg AS (
                SELECT r.created_at::date AS day,
                       AVG(r.rating)      AS avg_rating,
                       COUNT(r.id)        AS cnt
                FROM   reviews r
                WHERE  r.specialist_id = :profileId
                  AND  r.status = 'APPROVED'
                  AND  r.created_at::date BETWEEN :from AND :to
                GROUP BY 1
            ),
            with_cumulative AS (
                SELECT ds.day,
                       a.avg_rating,
                       COALESCE(a.cnt, 0) AS cnt,
                       SUM(COALESCE(a.cnt, 0)) OVER (ORDER BY ds.day) AS cumulative
                FROM   date_series ds
                LEFT JOIN agg a ON a.day = ds.day
            )
            SELECT * FROM with_cumulative ORDER BY day
            """;

        return jdbc.sql(sql)
                .param("profileId", specialistProfileId)
                .param("from", from)
                .param("to", to)
                .query((rs, n) -> new RatingDayDto(
                        rs.getObject("day", LocalDate.class),
                        rs.getObject("avg_rating") != null ? rs.getDouble("avg_rating") : null,
                        rs.getLong("cnt"),
                        rs.getLong("cumulative")))
                .list();
    }

    // ── Services breakdown ────────────────────────────────────────────────────

    public List<ServiceBreakdownDto> getServicesBreakdown(Long specialistProfileId) {
        String sql = """
            SELECT svc.id,
                   svc.title,
                   COUNT(b.id)           AS cnt,
                   COALESCE(SUM(svc.price), 0) AS revenue
            FROM   bookings b
            JOIN   services svc ON svc.id = b.service_id
            WHERE  svc.specialist_id = :profileId
              AND  b.status IN ('CONFIRMED','COMPLETED')
            GROUP BY svc.id, svc.title
            ORDER BY cnt DESC
            """;

        List<ServiceBreakdownDto> rows = jdbc.sql(sql)
                .param("profileId", specialistProfileId)
                .query((rs, n) -> new ServiceBreakdownDto(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getLong("cnt"),
                        rs.getBigDecimal("revenue"),
                        0.0))
                .list();

        long total = rows.stream().mapToLong(ServiceBreakdownDto::getBookingsCount).sum();
        if (total > 0) {
            rows.forEach(r -> r.setShare(
                    BigDecimal.valueOf(r.getBookingsCount() * 100.0 / total)
                            .setScale(1, RoundingMode.HALF_UP).doubleValue()));
        }
        return rows;
    }

    // ── Summary KPIs ──────────────────────────────────────────────────────────

    public AnalyticsSummaryDto getSummary(Long specialistProfileId) {
        LocalDate today = LocalDate.now();
        LocalDate from30 = today.minusDays(30);
        LocalDate from60 = today.minusDays(60);

        String revSql = """
            SELECT COALESCE(SUM(svc.price), 0) AS rev, COUNT(b.id) AS cnt
            FROM   bookings b
            JOIN   services svc  ON svc.id = b.service_id
            JOIN   time_slots ts ON ts.id = b.time_slot_id
            WHERE  svc.specialist_id = :profileId
              AND  b.status IN ('CONFIRMED','COMPLETED')
              AND  ts.slot_date BETWEEN :from AND :to
            """;

        record PeriodStats(BigDecimal rev, long cnt) {}

        PeriodStats current = jdbc.sql(revSql)
                .param("profileId", specialistProfileId)
                .param("from", from30)
                .param("to", today)
                .query((rs, n) -> new PeriodStats(rs.getBigDecimal("rev"), rs.getLong("cnt")))
                .single();

        PeriodStats prev = jdbc.sql(revSql)
                .param("profileId", specialistProfileId)
                .param("from", from60)
                .param("to", from30.minusDays(1))
                .query((rs, n) -> new PeriodStats(rs.getBigDecimal("rev"), rs.getLong("cnt")))
                .single();

        String ratingSql = """
            SELECT AVG(r.rating) AS avg_rating
            FROM   reviews r
            WHERE  r.specialist_id = :profileId AND r.status = 'APPROVED'
            """;
        Double avgRating = jdbc.sql(ratingSql)
                .param("profileId", specialistProfileId)
                .query((rs, n) -> rs.getObject("avg_rating") != null ? rs.getDouble("avg_rating") : null)
                .single();

        // Repeat clients: clients with >1 completed booking
        String repeatSql = """
            SELECT COUNT(DISTINCT b.client_id) AS all_clients,
                   COUNT(DISTINCT CASE WHEN sub.cnt > 1 THEN b.client_id END) AS repeat_clients
            FROM   bookings b
            JOIN   services svc ON svc.id = b.service_id
            JOIN   (SELECT client_id, COUNT(*) AS cnt
                    FROM   bookings b2
                    JOIN   services s2 ON s2.id = b2.service_id
                    WHERE  s2.specialist_id = :profileId
                      AND  b2.status IN ('CONFIRMED','COMPLETED')
                    GROUP BY client_id) sub ON sub.client_id = b.client_id
            WHERE  svc.specialist_id = :profileId
              AND  b.status IN ('CONFIRMED','COMPLETED')
            """;

        record RepeatStats(long all, long repeat) {}
        RepeatStats rs2 = jdbc.sql(repeatSql)
                .param("profileId", specialistProfileId)
                .query((rs, n) -> new RepeatStats(rs.getLong("all_clients"), rs.getLong("repeat_clients")))
                .single();

        double repeatPct = rs2.all() > 0 ? (rs2.repeat() * 100.0 / rs2.all()) : 0.0;

        BigDecimal revenueChangePct = null;
        Long bookingsChangePct = null;
        if (prev.rev().compareTo(BigDecimal.ZERO) > 0) {
            revenueChangePct = current.rev().subtract(prev.rev())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(prev.rev(), 1, RoundingMode.HALF_UP);
        }
        if (prev.cnt() > 0) {
            bookingsChangePct = Math.round((current.cnt() - prev.cnt()) * 100.0 / prev.cnt());
        }

        return AnalyticsSummaryDto.builder()
                .totalRevenue30d(current.rev())
                .totalBookings30d(current.cnt())
                .avgRating(avgRating)
                .repeatClientPct(Math.round(repeatPct * 10.0) / 10.0)
                .revenueChangePct(revenueChangePct)
                .bookingsChangePct(bookingsChangePct)
                .build();
    }
}
