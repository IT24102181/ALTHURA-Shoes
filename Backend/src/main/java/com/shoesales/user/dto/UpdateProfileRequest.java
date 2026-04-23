package com.shoesales.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 100)
    private String lastName;

    @Min(value = 1, message = "Age must be a positive number")
    private Integer age;

    @Size(max = 20)
    private String phone;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(min = 5, max = 5, message = "Postal Code must be exactly 5 digits")
    @Pattern(regexp = "^[0-9]{5}$", message = "Postal Code must contain only 5 numeric digits")
    private String postalCode;

    private LocalDate dateOfBirth;
}
