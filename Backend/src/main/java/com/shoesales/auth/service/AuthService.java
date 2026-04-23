package com.shoesales.auth.service;

import com.shoesales.auth.dto.LoginRequest;
import com.shoesales.auth.dto.LoginResponse;
import com.shoesales.auth.dto.RegisterRequest;
import com.shoesales.auth.dto.MessageResponse;

public interface AuthService {
    MessageResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}
