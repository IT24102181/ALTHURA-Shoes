package com.shoesales.user.service.impl;

import com.shoesales.user.dto.ChangePasswordRequest;
import com.shoesales.user.dto.CreateUserRequest;
import com.shoesales.user.dto.UpdateProfileRequest;
import com.shoesales.user.entity.User;
import com.shoesales.user.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.shoesales.user.service.UserService;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public User createUser(CreateUserRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Error: Create user request is required.");
        }
        if (!StringUtils.hasText(request.getFirstName())) {
            throw new IllegalArgumentException("Error: First name is required.");
        }
        if (!StringUtils.hasText(request.getLastName())) {
            throw new IllegalArgumentException("Error: Last name is required.");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is required.");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Error: Password is required.");
        }
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Error: Role is required.");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new IllegalArgumentException("Error: Email is already in use.");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(request.getActive() == null ? true : request.getActive())
                .age(request.getAge())
                .postalCode(request.getPostalCode())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .build();

        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return Optional.empty();
        }
        return userRepository.findByEmailIgnoreCase(email.trim());
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setAge(request.getAge());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPostalCode(request.getPostalCode());
        user.setDateOfBirth(request.getDateOfBirth());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public boolean changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public User updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        if (!"ACTIVE".equalsIgnoreCase(status) && !"DEACTIVATED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Error: Status must be ACTIVE or DEACTIVATED.");
        }
        user.setActive(!"DEACTIVATED".equalsIgnoreCase(status));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        // Delete related data in the correct foreign key order
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM carts WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM carts WHERE user_id = ?", userId);
        userRepository.delete(user);
    }
}
