package com.shoesales.delivery.service;

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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public interface DeliveryService {
    DeliveryResponse addDeliveryAddress(Long userId, DeliveryRequest request);
    DeliveryResponse getDeliveryByOrderId(Long orderId);
    List<DeliveryResponse> getAllDeliveries();
    DeliveryResponse updateDeliveryStatus(Long deliveryId, String trackingNumber, DeliveryStatus status);
}
