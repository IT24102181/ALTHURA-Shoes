package com.shoesales.auth.service.impl;

import com.shoesales.auth.dto.LoginRequest;
import com.shoesales.auth.dto.LoginResponse;
import com.shoesales.auth.dto.MessageResponse;
import com.shoesales.auth.dto.RegisterRequest;
import com.shoesales.auth.service.AuthService;
import com.shoesales.config.JwtUtils;
import com.shoesales.config.UserDetailsImpl;
import com.shoesales.user.entity.Role;
import com.shoesales.user.entity.User;
import com.shoesales.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        final String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .active(true)
                .age(request.getAge())
                .postalCode(request.getPostalCode())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .build();

        userRepository.save(user);
        return new MessageResponse("User registered successfully!");
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        final String email = request.getEmail().trim().toLowerCase();
        System.out.println("Processing login attempt for email: [" + email + "]");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("Login success for: [" + email + "] with role: " + userDetails.getRole());
            return new LoginResponse(jwt, userDetails.getEmail(), userDetails.getRole());
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            System.err.println("Login failure for: [" + email + "] - Invalid credentials");
            throw new IllegalArgumentException("Invalid email or password.");
        } catch (Exception e) {
            System.err.println("Login failure for: [" + email + "] - Error: " + e.getMessage());
            throw e;
        }
    }
}
