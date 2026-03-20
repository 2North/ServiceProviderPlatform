package com.diploma.spp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDto {
    Long id;
    @NotBlank
    String title;
    String description;
    @NotNull
    BigDecimal price;
    @NotNull
    Integer duration;
    Boolean active;
    Long categoryId;
    Long specialistProfileId;
}
