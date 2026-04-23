package com.shoesales.user.service;

import com.shoesales.user.dto.ChangePasswordRequest;
import com.shoesales.user.dto.CreateUserRequest;
import com.shoesales.user.dto.UpdateProfileRequest;
import com.shoesales.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(CreateUserRequest request);
    Optional<User> getUserById(Long id);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    User updateProfile(Long userId, UpdateProfileRequest request);
    boolean changePassword(Long userId, ChangePasswordRequest request);
    User updateUserStatus(Long userId, String status);
    void deleteUser(Long userId);
}
