package com.shoesales.cart.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Double price;
    private Integer quantity;
    private String size;
    private Double subTotal;
    private Double discountedPrice;
    private Double discountedSubTotal;
    private String appliedPromotionTitle;
}
