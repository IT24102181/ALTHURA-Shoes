package com.shoesales.payment.service.impl;

import com.shoesales.payment.service.PaymentService;

import com.shoesales.payment.dto.PaymentRequest;
import com.shoesales.payment.dto.PaymentResponse;
import com.shoesales.order.entity.Order;
import com.shoesales.order.entity.OrderStatus;
import com.shoesales.payment.entity.Payment;
import com.shoesales.payment.entity.PaymentStatus;
import com.shoesales.order.repository.OrderRepository;
import com.shoesales.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public PaymentResponse makePayment(Long userId, PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Error: Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: Unauthorized to pay for this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Error: Order is already processed or cancelled");
        }

        // Check if payment already exists
        paymentRepository.findByOrderId(order.getId()).ifPresent(payment -> {
            throw new RuntimeException("Error: Payment already exists for this order");
        });

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotal())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PAID) // Assume successful for now
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update order status
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return mapToResponse(savedPayment);
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Payment not found for order"));
        return mapToResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Error: Payment not found"));
        payment.setStatus(status);

        if (status == PaymentStatus.FAILED) {
            payment.getOrder().setStatus(OrderStatus.CANCELLED);
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void deletePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Error: Payment not found"));
        
        if (payment.getStatus() != PaymentStatus.FAILED) {
            throw new RuntimeException("Error: Only failed payments can be deleted");
        }
        
        paymentRepository.delete(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt().toString())
                .build();
    }
}
