package com.shoesales.delivery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryResponse {
    private Long id;
    private Long orderId;
    private String address;
    private String status;
    private String trackingNumber;
    private String createdAt;
}
