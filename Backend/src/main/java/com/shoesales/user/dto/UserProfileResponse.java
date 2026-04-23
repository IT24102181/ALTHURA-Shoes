package com.shoesales.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Integer age;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String dateOfBirth;
    private String createdAt;
}
