package com.diploma.spp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    int status;
    String message;
    LocalDateTime timestamp;
}
