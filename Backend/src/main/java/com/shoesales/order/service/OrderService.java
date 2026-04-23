package com.shoesales.order.service;

import com.shoesales.order.dto.OrderItemResponse;
import com.shoesales.order.dto.OrderResponse;
import com.shoesales.order.entity.Order;
import com.shoesales.order.entity.OrderItem;
import com.shoesales.order.entity.OrderStatus;
import com.shoesales.user.entity.User;
import com.shoesales.order.repository.OrderRepository;
import com.shoesales.cart.repository.CartRepository;
import com.shoesales.product.repository.ProductRepository;
import com.shoesales.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

public interface OrderService {
    OrderResponse createOrderFromCart(Long userId, String deliveryAddress);
    List<OrderResponse> getOrdersByUserId(Long userId);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Long orderId);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
    OrderResponse confirmDeliveryReceived(Long orderId, Long userId);
}
