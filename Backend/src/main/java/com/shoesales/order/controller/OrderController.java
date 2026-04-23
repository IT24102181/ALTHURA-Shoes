package com.shoesales.order.controller;

import com.shoesales.order.dto.OrderRequest;
import com.shoesales.order.dto.OrderResponse;
import com.shoesales.order.entity.OrderStatus;
import com.shoesales.config.UserDetailsImpl;
import jakarta.validation.Valid;
import com.shoesales.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> createOrderFromCart(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(getCurrentUserId(), request.getDeliveryAddress()));
    }

    @GetMapping("/myorders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getOrdersByUserId(getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        // Customer should only see their own order technically, but we keep it simple
        // for now
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> confirmDeliveryReceived(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.confirmDeliveryReceived(id, getCurrentUserId()));
    }

    // --- Admin Endpoints ---

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        try {
            System.out.println("Admin fetching all orders...");
            List<OrderResponse> orders = orderService.getAllOrders();
            System.out.println("Found " + (orders != null ? orders.size() : 0) + " orders.");
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in getAllOrders: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
