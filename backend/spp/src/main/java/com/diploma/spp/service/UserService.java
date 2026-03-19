package com.diploma.spp.service;

import com.diploma.spp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;


    public UserDetails loadUserByUsername(String email){
        return userRepository.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("User not found" + email));
    }
}
