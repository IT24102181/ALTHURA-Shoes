package com.shoesales.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRequest {
    @NotNull
    private Long orderId;

    @NotBlank
    private String address;
}
