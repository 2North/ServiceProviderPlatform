package com.diploma.spp.service;

import com.diploma.spp.config.GoogleOAuthProperties;
import com.diploma.spp.model.Booking;
import com.diploma.spp.model.User;
import com.diploma.spp.model.UserGoogleIntegration;
import com.diploma.spp.repository.UserGoogleIntegrationRepository;
import com.diploma.spp.security.AesTokenEncryptor;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private static final String APP_NAME = "ServicePort Platform";
    private static final String SCOPE = CalendarScopes.CALENDAR_EVENTS;
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleOAuthProperties properties;
    private final UserGoogleIntegrationRepository integrationRepository;
    private final AesTokenEncryptor encryptor;

    // ── OAuth flow ──────────────────────────────────────────────────────────

    public String buildAuthorizationUrl(Long userId) throws GeneralSecurityException, IOException {
        GoogleAuthorizationCodeFlow flow = buildFlow();
        return flow.newAuthorizationUrl()
                .setRedirectUri(properties.getOauth().getRedirectUri())
                .setState(String.valueOf(userId))
                .build();
    }

    @Transactional
    public void handleCallback(String code, Long userId) throws GeneralSecurityException, IOException {
        GoogleAuthorizationCodeFlow flow = buildFlow();
        GoogleTokenResponse tokenResponse = flow.newTokenRequest(code)
                .setRedirectUri(properties.getOauth().getRedirectUri())
                .execute();

        User userRef = new User();
        userRef.setId(userId);

        UserGoogleIntegration integration = integrationRepository.findByUser_Id(userId)
                .orElse(UserGoogleIntegration.builder()
                        .user(userRef)
                        .connectedAt(LocalDateTime.now())
                        .build());

        integration.setRefreshToken(encryptor.encrypt(tokenResponse.getRefreshToken()));
        integration.setAccessToken(encryptor.encrypt(tokenResponse.getAccessToken()));
        integration.setTokenExpiresAt(LocalDateTime.now().plusSeconds(
                tokenResponse.getExpiresInSeconds() != null ? tokenResponse.getExpiresInSeconds() : 3600));
        integration.setValid(true);

        integrationRepository.save(integration);
    }

    @Transactional
    public void revokeIntegration(Long userId) {
        integrationRepository.deleteByUser_Id(userId);
    }

    // ── Calendar event operations ────────────────────────────────────────────

    /**
     * Creates calendar events for both participants of a confirmed booking.
     * Returns a map of userId -> googleEventId for the events that were created.
     */
    public Map<Long, String> createEventForBooking(Booking booking) {
        Map<Long, String> result = new HashMap<>();

        User client = booking.getClient();
        User specialist = booking.getService().getSpecialistProfile().getUser();

        // Create event in client's calendar (they see specialist name)
        tryCreateEvent(client, booking, specialist.getFirstName() + " " + specialist.getLastName())
                .ifPresent(id -> result.put(client.getId(), id));

        // Create event in specialist's calendar (they see client name)
        tryCreateEvent(specialist, booking, client.getFirstName() + " " + client.getLastName())
                .ifPresent(id -> result.put(specialist.getId(), id));

        return result;
    }

    /**
     * Deletes calendar events for both participants when a booking is cancelled.
     */
    public void cancelEventForBooking(Booking booking) {
        User client = booking.getClient();
        User specialist = booking.getService().getSpecialistProfile().getUser();

        if (booking.getGoogleEventIdClient() != null) {
            tryDeleteEvent(client, booking.getGoogleEventIdClient());
        }
        if (booking.getGoogleEventIdSpecialist() != null) {
            tryDeleteEvent(specialist, booking.getGoogleEventIdSpecialist());
        }
    }

    /**
     * Updates calendar events (title, time) when a booking is rescheduled.
     */
    public void updateEventForBooking(Booking booking) {
        User client = booking.getClient();
        User specialist = booking.getService().getSpecialistProfile().getUser();

        if (booking.getGoogleEventIdClient() != null) {
            tryUpdateEvent(client, booking, booking.getGoogleEventIdClient(),
                    specialist.getFirstName() + " " + specialist.getLastName());
        }
        if (booking.getGoogleEventIdSpecialist() != null) {
            tryUpdateEvent(specialist, booking, booking.getGoogleEventIdSpecialist(),
                    client.getFirstName() + " " + client.getLastName());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Optional<String> tryCreateEvent(User user, Booking booking, String counterpartName) {
        return integrationRepository.findByUser_Id(user.getId())
                .filter(UserGoogleIntegration::isValid)
                .flatMap(integration -> {
                    try {
                        Calendar calendarClient = buildCalendarClient(integration);
                        Event event = buildEvent(booking, counterpartName,
                                getCounterpart(user, booking));
                        Event created = calendarClient.events()
                                .insert(integration.getCalendarId(), event)
                                .setSendUpdates("none")
                                .execute();
                        return Optional.of(created.getId());
                    } catch (IOException | GeneralSecurityException e) {
                        log.warn("Failed to create Google Calendar event for user {}: {}", user.getId(), e.getMessage());
                        return Optional.empty();
                    }
                });
    }

    private void tryDeleteEvent(User user, String eventId) {
        integrationRepository.findByUser_Id(user.getId())
                .filter(UserGoogleIntegration::isValid)
                .ifPresent(integration -> {
                    try {
                        Calendar calendarClient = buildCalendarClient(integration);
                        calendarClient.events()
                                .delete(integration.getCalendarId(), eventId)
                                .execute();
                    } catch (IOException | GeneralSecurityException e) {
                        log.warn("Failed to delete Google Calendar event {} for user {}: {}",
                                eventId, user.getId(), e.getMessage());
                    }
                });
    }

    private void tryUpdateEvent(User user, Booking booking, String eventId, String counterpartName) {
        integrationRepository.findByUser_Id(user.getId())
                .filter(UserGoogleIntegration::isValid)
                .ifPresent(integration -> {
                    try {
                        Calendar calendarClient = buildCalendarClient(integration);
                        Event event = buildEvent(booking, counterpartName, getCounterpart(user, booking));
                        calendarClient.events()
                                .update(integration.getCalendarId(), eventId, event)
                                .setSendUpdates("none")
                                .execute();
                    } catch (IOException | GeneralSecurityException e) {
                        log.warn("Failed to update Google Calendar event {} for user {}: {}",
                                eventId, user.getId(), e.getMessage());
                    }
                });
    }

    private Event buildEvent(Booking booking, String counterpartName, User counterpart) {
        var slot = booking.getTimeSlot();
        ZoneId zone = ZoneId.systemDefault();

        ZonedDateTime startZdt = slot.getSlotDate().atTime(slot.getStartTime()).atZone(zone);
        ZonedDateTime endZdt = slot.getSlotDate().atTime(slot.getEndTime()).atZone(zone);

        EventDateTime start = new EventDateTime()
                .setDateTime(new DateTime(startZdt.toInstant().toEpochMilli()))
                .setTimeZone(zone.getId());
        EventDateTime end = new EventDateTime()
                .setDateTime(new DateTime(endZdt.toInstant().toEpochMilli()))
                .setTimeZone(zone.getId());

        String description = buildDescription(booking, counterpart);

        Event event = new Event()
                .setSummary(booking.getService().getTitle() + " — " + counterpartName)
                .setDescription(description)
                .setStart(start)
                .setEnd(end);

        // Add counterpart as attendee without triggering Google's email
        EventAttendee attendee = new EventAttendee()
                .setEmail(counterpart.getEmail())
                .setResponseStatus("accepted");
        event.setAttendees(List.of(attendee));

        // 60-minute reminder
        EventReminder reminder = new EventReminder()
                .setMethod("popup")
                .setMinutes(60);
        event.setReminders(new Event.Reminders()
                .setUseDefault(false)
                .setOverrides(List.of(reminder)));

        return event;
    }

    private String buildDescription(Booking booking, User counterpart) {
        StringBuilder sb = new StringBuilder();
        sb.append("Контакт: ").append(counterpart.getFirstName())
                .append(" ").append(counterpart.getLastName());
        if (counterpart.getPhone() != null) {
            sb.append("\nТелефон: ").append(counterpart.getPhone());
        }
        sb.append("\nEmail: ").append(counterpart.getEmail());
        sb.append("\n\nБронирование #").append(booking.getId());
        sb.append("\nСервис: ").append(booking.getService().getTitle());
        if (booking.getNote() != null && !booking.getNote().isBlank()) {
            sb.append("\n\nПримечания клиента: ").append(booking.getNote());
        }
        sb.append("\n\nПросмотреть бронирование: http://localhost:5173/bookings/").append(booking.getId());
        return sb.toString();
    }

    private User getCounterpart(User user, Booking booking) {
        User client = booking.getClient();
        User specialist = booking.getService().getSpecialistProfile().getUser();
        return user.getId().equals(client.getId()) ? specialist : client;
    }

    // ── Google client builders ───────────────────────────────────────────────

    private Calendar buildCalendarClient(UserGoogleIntegration integration)
            throws GeneralSecurityException, IOException {

        NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        String accessToken = refreshIfNeeded(integration, transport);

        com.google.api.client.auth.oauth2.Credential credential =
                new com.google.api.client.auth.oauth2.Credential(
                        com.google.api.client.auth.oauth2.BearerToken.authorizationHeaderAccessMethod())
                        .setAccessToken(accessToken);

        return new Calendar.Builder(transport, JSON_FACTORY, credential)
                .setApplicationName(APP_NAME)
                .build();
    }

    @Transactional
    public String refreshIfNeeded(UserGoogleIntegration integration, NetHttpTransport transport)
            throws IOException {

        boolean expired = integration.getTokenExpiresAt() == null
                || integration.getTokenExpiresAt().isBefore(LocalDateTime.now().plusMinutes(1));

        if (!expired && integration.getAccessToken() != null) {
            return encryptor.decrypt(integration.getAccessToken());
        }

        // Refresh via Google token endpoint
        String refreshToken = encryptor.decrypt(integration.getRefreshToken());
        com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest request =
                new com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest(
                        transport,
                        JSON_FACTORY,
                        refreshToken,
                        properties.getOauth().getClientId(),
                        properties.getOauth().getClientSecret());

        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse response = request.execute();
            integration.setAccessToken(encryptor.encrypt(response.getAccessToken()));
            integration.setTokenExpiresAt(LocalDateTime.now().plusSeconds(
                    response.getExpiresInSeconds() != null ? response.getExpiresInSeconds() : 3600));
            integrationRepository.save(integration);
            return response.getAccessToken();
        } catch (com.google.api.client.auth.oauth2.TokenResponseException e) {
            if ("invalid_grant".equals(e.getDetails().getError())) {
                integration.setValid(false);
                integrationRepository.save(integration);
                log.warn("Google refresh token revoked for user {}, marking integration invalid",
                        integration.getUser().getId());
            }
            throw e;
        }
    }

    private GoogleAuthorizationCodeFlow buildFlow() throws GeneralSecurityException, IOException {
        NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details()
                .setClientId(properties.getOauth().getClientId())
                .setClientSecret(properties.getOauth().getClientSecret());
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets().setInstalled(details);

        return new GoogleAuthorizationCodeFlow.Builder(transport, JSON_FACTORY, clientSecrets,
                List.of(SCOPE))
                .setAccessType("offline")
                .build();
    }
}
