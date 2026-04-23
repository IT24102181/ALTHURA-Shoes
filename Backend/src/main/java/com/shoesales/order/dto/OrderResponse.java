package com.shoesales.order.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String formattedId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Double total;
    private String status;
    private String deliveryAddress;
    private String createdAt;
    private List<OrderItemResponse> items;
}
