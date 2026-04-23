package com.shoesales.order.mapper;

import com.shoesales.order.dto.OrderItemResponse;
import com.shoesales.order.dto.OrderResponse;
import com.shoesales.order.entity.Order;
import com.shoesales.order.entity.OrderItem;
import com.shoesales.delivery.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    @Autowired
    private DeliveryRepository deliveryRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public OrderResponse mapToResponse(Order order) {
        try {
            if (order == null) return null;
            System.out.println("Processing mapping for Order ID: " + order.getId());

            List<OrderItemResponse> itemResponses = new ArrayList<>();
            if (order.getItems() != null) {
                itemResponses = order.getItems().stream()
                        .map(this::mapItemToResponse)
                        .collect(Collectors.toList());
            }

            String userName = "Unknown User";
            String userEmail = "Unknown Email";
            Long userId = null;

            if (order.getUser() != null) {
                userId = order.getUser().getId();
                String first = order.getUser().getFirstName() != null ? order.getUser().getFirstName() : "";
                String last = order.getUser().getLastName() != null ? order.getUser().getLastName() : "";
                userName = (first + " " + last).trim();
                userEmail = order.getUser().getEmail() != null ? order.getUser().getEmail() : "No Email";
                System.out.println("Mapped User: " + userName + " (" + userEmail + ")");
            }

            String formattedId = String.format("ORD-%03d", order.getId());

            String address = order.getDeliveryAddress();
            if (address == null || address.trim().isEmpty() || address.equals("No Address Provided")) {
                address = deliveryRepository.findByOrderId(order.getId())
                        .map(d -> d.getAddress())
                        .orElse("No Address Provided");
            }

            return OrderResponse.builder()
                    .id(order.getId())
                    .formattedId(formattedId)
                    .userId(userId)
                    .userName(userName)
                    .userEmail(userEmail)
                    .total(order.getTotal())
                    .status(order.getStatus() != null ? order.getStatus().name() : "PENDING")
                    .deliveryAddress(address)
                    .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "N/A")
                    .items(itemResponses)
                    .build();
        } catch (Exception e) {
            System.err.println("MAPPING ERROR for Order ID " + (order != null ? order.getId() : "null") + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        if (item == null) return null;

        Long productId = null;
        String productName = "Unknown Product";
        String productImageUrl = null;

        if (item.getProduct() != null) {
            productId = item.getProduct().getId();
            productName = item.getProduct().getName();
            productImageUrl = item.getProduct().getImageUrl();
        }

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(productId)
                .productName(productName)
                .productImageUrl(productImageUrl)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build();
    }
}
