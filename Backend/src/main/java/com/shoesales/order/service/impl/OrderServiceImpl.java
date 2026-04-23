package com.shoesales.order.service.impl;

import com.shoesales.order.service.OrderService;

import com.shoesales.order.dto.OrderItemResponse;
import com.shoesales.order.dto.OrderResponse;
import com.shoesales.order.entity.Order;
import com.shoesales.order.entity.OrderItem;
import com.shoesales.order.entity.OrderStatus;
import com.shoesales.cart.entity.Cart;
import com.shoesales.cart.entity.CartItem;
import com.shoesales.product.entity.Product;
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
import com.shoesales.delivery.entity.Delivery;
import com.shoesales.delivery.entity.DeliveryStatus;
import com.shoesales.delivery.repository.DeliveryRepository;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.shoesales.order.mapper.OrderMapper orderMapper;

    @Transactional
    public OrderResponse createOrderFromCart(Long userId, String deliveryAddress) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Error: Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Error: Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .total(0.0)
                .deliveryAddress(deliveryAddress)
                .build();

        double total = 0.0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Error: Insufficient stock for " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.getItems().add(orderItem);
            total += (product.getPrice() * cartItem.getQuantity());
        }

        order.setTotal(total);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order placement
        cart.getItems().clear();
        cartRepository.save(cart);

        // Auto-create Delivery Record for the new order
        Delivery delivery = Delivery.builder()
                .order(savedOrder)
                .address(deliveryAddress)
                .status(DeliveryStatus.ASSIGNED)
                .trackingNumber("TRK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        deliveryRepository.save(delivery);

        return orderMapper.mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(orderMapper::mapToResponse)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::mapToResponse)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Order not found"));
        return orderMapper.mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Order not found"));

        // If order is cancelled, we should restore stock
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        // Auto-create delivery record if order is moved out of PENDING/CANCELLED and doesn't have one
        if (status != OrderStatus.CANCELLED && status != OrderStatus.PENDING) {
            if (deliveryRepository.findByOrderId(order.getId()).isEmpty()) {
                Delivery delivery = Delivery.builder()
                        .order(order)
                        .address(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "No Address")
                        .status(DeliveryStatus.ASSIGNED)
                        .trackingNumber("TRK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .build();
                deliveryRepository.save(delivery);
            }
        }

        order.setStatus(status);
        return orderMapper.mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse confirmDeliveryReceived(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: Unauthorized. This order does not belong to you.");
        }

        // Must be in a state that implies delivery is coming (e.g. SHIPPED basically, though here we use generic PENDING or other status)
        order.setStatus(OrderStatus.DELIVERED);

        deliveryRepository.findByOrderId(orderId).ifPresent(delivery -> {
            delivery.setStatus(DeliveryStatus.DELIVERED);
            deliveryRepository.save(delivery);
        });

        return orderMapper.mapToResponse(orderRepository.save(order));
    }
}

