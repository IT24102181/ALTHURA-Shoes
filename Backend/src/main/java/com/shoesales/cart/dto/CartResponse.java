package com.shoesales.cart.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private Double total;
    private Double originalTotal;
    private Double discountTotal;
}
