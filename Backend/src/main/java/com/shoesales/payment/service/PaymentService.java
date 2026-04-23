package com.shoesales.payment.service;

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

public interface PaymentService {
    PaymentResponse makePayment(Long userId, PaymentRequest request);
    PaymentResponse getPaymentByOrderId(Long orderId);
    List<PaymentResponse> getAllPayments();
    PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status);
    void deletePayment(Long paymentId);
}
