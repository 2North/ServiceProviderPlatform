package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "specialist_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;

    String bio;

    Integer experience;

    BigDecimal rating;

    boolean verified;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
