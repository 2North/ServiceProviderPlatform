package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column (nullable = false, unique = true)
    String email;

    @Column (nullable = false)
    String password;

    @Column (nullable = false)
    String firstName;

    @Column (nullable = false)
    String lastName;

    String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role;

    boolean enabled;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;


}
