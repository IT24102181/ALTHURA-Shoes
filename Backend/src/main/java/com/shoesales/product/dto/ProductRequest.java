package com.shoesales.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String brand;

    @NotBlank
    private String category;

    private String size;
    private String color;

    @NotNull
    @Min(0)
    private Double price;

    @NotNull
    @Min(0)
    private Integer stockQuantity;

    private String description;
    private String imageUrl;
}
