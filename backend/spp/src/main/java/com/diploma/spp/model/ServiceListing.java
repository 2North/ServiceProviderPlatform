package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "specialist_id")
    SpecialistProfile specialistProfile;

    @ManyToOne
    @JoinColumn(name = "category_id")
    Category category;

    @Column(nullable = false)
    String title;

    String description;

    @Column(nullable = false)
    BigDecimal price;

    @Column(nullable = false)
    Integer duration;

    @Column(nullable = false)
    boolean active;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
