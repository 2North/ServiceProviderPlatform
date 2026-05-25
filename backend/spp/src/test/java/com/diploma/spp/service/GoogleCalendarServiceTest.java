package com.diploma.spp.service;

import com.diploma.spp.config.GoogleOAuthProperties;
import com.diploma.spp.model.*;
import com.diploma.spp.repository.UserGoogleIntegrationRepository;
import com.diploma.spp.security.AesTokenEncryptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleCalendarServiceTest {

    @Mock
    private UserGoogleIntegrationRepository integrationRepository;

    @Mock
    private AesTokenEncryptor encryptor;

    @Mock
    private GoogleOAuthProperties properties;

    @InjectMocks
    private GoogleCalendarService googleCalendarService;

    private User client;
    private User specialist;
    private Booking booking;

    @BeforeEach
    void setUp() {
        client = User.builder()
                .id(1L)
                .email("client@test.com")
                .firstName("Ivan")
                .lastName("Petrov")
                .build();

        specialist = User.builder()
                .id(2L)
                .email("specialist@test.com")
                .firstName("Anna")
                .lastName("Sidorova")
                .build();

        SpecialistProfile profile = SpecialistProfile.builder()
                .id(10L)
                .user(specialist)
                .build();

        ServiceListing service = ServiceListing.builder()
                .id(100L)
                .title("Haircut")
                .specialistProfile(profile)
                .build();

        TimeSlot slot = TimeSlot.builder()
                .id(200L)
                .slotDate(LocalDate.of(2026, 6, 15))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .status(SlotStatus.BOOKED)
                .build();

        booking = Booking.builder()
                .id(300L)
                .client(client)
                .service(service)
                .timeSlot(slot)
                .status(BookingStatus.CONFIRMED)
                .note("Please be on time")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createEventForBooking_noIntegrationsConnected_returnsEmptyMap() {
        when(integrationRepository.findByUser_Id(anyLong())).thenReturn(Optional.empty());

        Map<Long, String> result = googleCalendarService.createEventForBooking(booking);

        assertThat(result).isEmpty();
        verify(integrationRepository, times(2)).findByUser_Id(anyLong());
    }

    @Test
    void createEventForBooking_invalidIntegration_skipsUser() {
        UserGoogleIntegration invalidIntegration = UserGoogleIntegration.builder()
                .id(1L)
                .user(client)
                .valid(false)
                .calendarId("primary")
                .connectedAt(LocalDateTime.now())
                .refreshToken("enc-token")
                .build();

        when(integrationRepository.findByUser_Id(client.getId())).thenReturn(Optional.of(invalidIntegration));
        when(integrationRepository.findByUser_Id(specialist.getId())).thenReturn(Optional.empty());

        Map<Long, String> result = googleCalendarService.createEventForBooking(booking);

        assertThat(result).isEmpty();
    }

    @Test
    void cancelEventForBooking_noEventIds_doesNothing() {
        // booking has no google event ids set
        booking.setGoogleEventIdClient(null);
        booking.setGoogleEventIdSpecialist(null);

        googleCalendarService.cancelEventForBooking(booking);

        verify(integrationRepository, never()).findByUser_Id(anyLong());
    }

    @Test
    void revokeIntegration_delegatesToRepository() {
        googleCalendarService.revokeIntegration(1L);
        verify(integrationRepository).deleteByUser_Id(1L);
    }
}
