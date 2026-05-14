package com.diploma.spp.dto;

import com.diploma.spp.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    Long id;
    String email;
    String firstName;
    String lastName;
    Role role;
}