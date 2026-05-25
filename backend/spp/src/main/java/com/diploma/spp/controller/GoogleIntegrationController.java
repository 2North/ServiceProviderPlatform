package com.diploma.spp.controller;

import com.diploma.spp.dto.GoogleIntegrationStatusDto;
import com.diploma.spp.model.User;
import com.diploma.spp.model.UserGoogleIntegration;
import com.diploma.spp.repository.UserGoogleIntegrationRepository;
import com.diploma.spp.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/integrations/google")
@RequiredArgsConstructor
public class GoogleIntegrationController {

    private final GoogleCalendarService googleCalendarService;
    private final UserGoogleIntegrationRepository integrationRepository;

    /**
     * Returns the Google OAuth authorization URL as JSON so the frontend
     * can navigate to it while still sending the JWT via axios.
     */
    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl(@AuthenticationPrincipal User user)
            throws GeneralSecurityException, IOException {
        String url = googleCalendarService.buildAuthorizationUrl(user.getId());
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Redirect the authenticated user to the Google OAuth consent screen.
     */
    @GetMapping("/auth")
    public ResponseEntity<Void> startOAuth(@AuthenticationPrincipal User user)
            throws GeneralSecurityException, IOException {
        String url = googleCalendarService.buildAuthorizationUrl(user.getId());
        return ResponseEntity.status(302).location(URI.create(url)).build();
    }

    /**
     * Google redirects here after user consent.
     * Exchanges the authorization code for tokens and stores them.
     * Then redirects to the frontend settings page.
     */
    @GetMapping("/callback")
    public ResponseEntity<Void> oauthCallback(
            @RequestParam String code,
            @RequestParam String state) throws GeneralSecurityException, IOException {

        Long userId = Long.parseLong(state);
        googleCalendarService.handleCallback(code, userId);
        // Redirect back to the frontend settings page after successful connection
        return ResponseEntity.status(302)
                .location(URI.create("http://localhost:5173/settings?google=connected"))
                .build();
    }

    /**
     * Returns the current Google Calendar integration status for the authenticated user.
     */
    @GetMapping("/status")
    public ResponseEntity<GoogleIntegrationStatusDto> getStatus(@AuthenticationPrincipal User user) {
        Optional<UserGoogleIntegration> integration = integrationRepository.findByUser_Id(user.getId());
        if (integration.isEmpty()) {
            return ResponseEntity.ok(GoogleIntegrationStatusDto.builder().connected(false).build());
        }
        UserGoogleIntegration i = integration.get();
        return ResponseEntity.ok(GoogleIntegrationStatusDto.builder()
                .connected(true)
                .valid(i.isValid())
                .calendarId(i.getCalendarId())
                .connectedAt(i.getConnectedAt())
                .build());
    }

    /**
     * Disconnects the Google Calendar integration for the authenticated user.
     */
    @DeleteMapping
    public ResponseEntity<Void> disconnect(@AuthenticationPrincipal User user) {
        googleCalendarService.revokeIntegration(user.getId());
        return ResponseEntity.noContent().build();
    }
}
