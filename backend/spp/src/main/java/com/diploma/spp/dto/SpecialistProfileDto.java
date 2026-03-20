package com.diploma.spp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialistProfileDto {
    Long id;
    String bio;
    Integer experience;
    BigDecimal rating;
    Boolean verified;
    String userEmail;
}
