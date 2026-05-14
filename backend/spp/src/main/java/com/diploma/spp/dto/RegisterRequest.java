package com.diploma.spp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    @Email
    String email;

    @NotBlank
    @Size(min = 8)
    String password;

    @NotBlank
    String firstName;

    @NotBlank
    String lastName;

    String phone;

    @Pattern(regexp = "CLIENT|SPECIALIST", message = "Role must be CLIENT or SPECIALIST")
    String role;
}
