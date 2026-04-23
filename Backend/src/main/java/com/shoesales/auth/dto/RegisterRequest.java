package com.shoesales.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Min(value = 1, message = "Age must be a positive number")
    private Integer age;

    @Size(max = 5, message = "Invalid Postal Code — must be 5 or fewer characters")
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Invalid Postal Code — only letters and numbers allowed")
    private String postalCode;

    @Size(max = 255)
    private String address;

    private LocalDate dateOfBirth;
}
