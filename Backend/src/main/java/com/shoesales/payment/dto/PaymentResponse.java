package com.shoesales.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Double amount;
    private String status;
    private String paymentMethod;
    private String createdAt;
}
