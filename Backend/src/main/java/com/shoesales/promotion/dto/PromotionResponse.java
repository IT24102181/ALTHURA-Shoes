package com.shoesales.promotion.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PromotionResponse {
    private Long id;
    private String title;
    private String description;
    private Double discountPercentage;
    private String startDate;
    private String endDate;
    private Boolean isActive;
    private String code;
    private String imageUrl;
    private String applicableCategory;
}
