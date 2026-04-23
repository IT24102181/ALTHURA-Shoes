package com.shoesales.user.dto;

import com.shoesales.user.entity.Role;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class CreateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Boolean active;
    private Integer age;
    private String postalCode;
    private String address;
    private LocalDate dateOfBirth;
}
