package com.diploma.spp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {
    @Email
    @NotBlank
    String email;

    @NotBlank
    @Size(min = 8)
    String password;
}
