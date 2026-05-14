package com.diploma.spp.service;

import com.diploma.spp.dto.AuthRequest;
import com.diploma.spp.dto.AuthResponse;
import com.diploma.spp.dto.RegisterRequest;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Role;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.UserRepository;
import com.diploma.spp.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest registerRequest){
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new ConflictException("Email already exists");
        }

        Role role = (registerRequest.getRole() != null && registerRequest.getRole().equals("SPECIALIST"))
                ? Role.SPECIALIST
                : Role.CLIENT;

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phone(registerRequest.getPhone())
                .role(role)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
        return AuthResponse.builder()
                .email(user.getEmail())
                .token(jwtUtils.generateToken(user.getEmail(), user.getRole().name()))
                .role(user.getRole().name())
                .build();
    }
    public AuthResponse login(AuthRequest loginRequest){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(
                () -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .email(user.getEmail())
                .token(jwtUtils.generateToken(user.getEmail(), user.getRole().name()))
                .role(user.getRole().name())
                .build();

    }
}
