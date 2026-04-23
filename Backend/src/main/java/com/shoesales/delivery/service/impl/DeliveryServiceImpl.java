package com.shoesales.delivery.service.impl;

import com.shoesales.delivery.service.DeliveryService;

import com.shoesales.delivery.dto.DeliveryRequest;
import com.shoesales.delivery.dto.DeliveryResponse;
import com.shoesales.delivery.entity.Delivery;
import com.shoesales.delivery.entity.DeliveryStatus;
import com.shoesales.order.entity.Order;
import com.shoesales.order.entity.OrderStatus;
import com.shoesales.delivery.repository.DeliveryRepository;
import com.shoesales.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public DeliveryResponse addDeliveryAddress(Long userId, DeliveryRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Error: Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: Unauthorized to modify this order's delivery");
        }

        // Ensure order is CONFIRMED before delivery can be assigned
        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Error: Order is not confirmed for delivery.");
        }

        deliveryRepository.findByOrderId(order.getId()).ifPresent(delivery -> {
            throw new RuntimeException("Error: Delivery info already exists");
        });

        Delivery delivery = Delivery.builder()
                .order(order)
                .address(request.getAddress())
                .status(DeliveryStatus.ASSIGNED)
                .trackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        return mapToResponse(deliveryRepository.save(delivery));
    }

    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Delivery info not found"));
        return mapToResponse(delivery);
    }

    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long deliveryId, String trackingNumber, DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Error: Delivery info not found"));

        delivery.setStatus(status);
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            delivery.setTrackingNumber(trackingNumber);
        }

        if (status == DeliveryStatus.DELIVERED) {
            delivery.getOrder().setStatus(OrderStatus.DELIVERED);
        }

        return mapToResponse(deliveryRepository.save(delivery));
    }

    private DeliveryResponse mapToResponse(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .orderId(delivery.getOrder().getId())
                .address(delivery.getAddress())
                .status(delivery.getStatus().name())
                .trackingNumber(delivery.getTrackingNumber())
                .createdAt(delivery.getCreatedAt().toString())
                .build();
    }
}
