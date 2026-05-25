package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_google_integrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGoogleIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    String refreshToken;

    @Column(columnDefinition = "TEXT")
    String accessToken;

    LocalDateTime tokenExpiresAt;

    @Column(nullable = false)
    @Builder.Default
    String calendarId = "primary";

    @Column(nullable = false)
    @Builder.Default
    boolean valid = true;

    @Column(nullable = false)
    LocalDateTime connectedAt;
}
