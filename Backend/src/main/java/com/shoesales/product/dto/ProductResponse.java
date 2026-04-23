package com.shoesales.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String category;
    private String size;
    private String color;
    private Double price;
    private Integer stockQuantity;
    private String description;
    private String imageUrl;
    private String status;
    private Double originalPrice;
    private Double discount;
}
