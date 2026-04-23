package com.shoesales.promotion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Min(0)
    @Max(100)
    private Double discountPercentage;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    private String code;

    private String imageUrl;

    private String applicableCategory;
}
