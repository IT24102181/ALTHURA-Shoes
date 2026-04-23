package com.shoesales.user.controller;

import com.shoesales.user.dto.ChangePasswordRequest;
import com.shoesales.user.dto.UpdateProfileRequest;
import com.shoesales.auth.dto.MessageResponse;
import com.shoesales.user.dto.AdminUserResponse;
import com.shoesales.user.dto.UserProfileResponse;
import com.shoesales.user.entity.User;
import com.shoesales.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getProfile() {
        String email = getCurrentUserEmail();
        User user = userService.getUserByEmail(email).orElseThrow(() -> new RuntimeException("Error: User not found"));

        return ResponseEntity.ok(new UserProfileResponse(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAge(),
                user.getPhone(),
                user.getAddress(),
                user.getCity(),
                user.getState(),
                user.getPostalCode(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getCreatedAt().toString()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found"))
                .getId();
        userService.updateProfile(userId, request);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }

    @PutMapping("/password")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found"))
                .getId();
        boolean isChanged = userService.changePassword(userId, request);
        if (!isChanged) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Incorrect old password!"));
        }
        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }

    // Admin-only endpoints for user management
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userService.getAllUsers().stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getActive(),
                        user.getAge(),
                        user.getPhone(),
                        user.getAddress(),
                        user.getCity(),
                        user.getState(),
                        user.getPostalCode(),
                        user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                        user.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable(name = "id") Long id, @RequestParam(name = "status") String status) {
        userService.updateUserStatus(id, status);
        return ResponseEntity.ok(new MessageResponse("User status updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable(name = "id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }

}
