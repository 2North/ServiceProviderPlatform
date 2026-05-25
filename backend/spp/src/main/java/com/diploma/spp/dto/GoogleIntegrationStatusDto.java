package com.diploma.spp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GoogleIntegrationStatusDto {
    boolean connected;
    boolean valid;
    String calendarId;
    LocalDateTime connectedAt;
}
