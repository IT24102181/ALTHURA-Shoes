package com.shoesales.auth.controller;

import com.shoesales.auth.dto.LoginRequest;
import com.shoesales.auth.dto.LoginResponse;
import com.shoesales.auth.dto.RegisterRequest;
import com.shoesales.user.dto.ResetPasswordRequest;
import com.shoesales.auth.dto.MessageResponse;
import com.shoesales.user.entity.User;
import com.shoesales.auth.service.AuthService;
import com.shoesales.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest) {
        User user = userRepository.findByEmail(resetRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: Email not found!"));

        user.setPassword(encoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
    }
}
