package com.shoesales.user.controller;

import com.shoesales.auth.dto.MessageResponse;
import com.shoesales.order.entity.Order;
import com.shoesales.order.repository.OrderRepository;
import com.shoesales.payment.entity.Payment;
import com.shoesales.payment.entity.PaymentStatus;
import com.shoesales.payment.repository.PaymentRepository;
import com.shoesales.product.repository.ProductRepository;
import com.shoesales.user.dto.AdminUserResponse;
import com.shoesales.user.dto.DashboardStatsResponse;
import com.shoesales.user.entity.Role;
import com.shoesales.user.entity.User;
import com.shoesales.user.repository.UserRepository;
import com.shoesales.user.service.UserService;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Builder;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

        @Autowired
        private UserService userService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private PaymentRepository paymentRepository;

        @GetMapping("/users")
        public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
                List<User> users = userService.getAllUsers();
                List<AdminUserResponse> responseList = users.stream().map(user -> new AdminUserResponse(
                                user.getId(),
                                user.getFirstName(),
                                user.getLastName(),
                                user.getEmail(),
                                user.getRole().name(),
                                Boolean.TRUE.equals(user.getActive()),
                                user.getAge(),
                                user.getPhone(),
                                user.getAddress(),
                                user.getCity(),
                                user.getState(),
                                user.getPostalCode(),
                                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(responseList);
        }

        @PutMapping("/users/{id}/deactivate")
        public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
                userService.updateUserStatus(id, "DEACTIVATED");
                return ResponseEntity.ok(new MessageResponse("User deactivated successfully!"));
        }

        @DeleteMapping("/users/{id}")
        public ResponseEntity<?> deleteUser(@PathVariable Long id) {
                userService.deleteUser(id);
                return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        }

        @Transactional(readOnly = true)
        @GetMapping("/dashboard/stats")
        public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
                try {
                        List<User> users = userRepository.findAll();
                        List<com.shoesales.product.entity.Product> products = productRepository.findAll();
                        List<Order> orders = orderRepository.findAll();
                        List<Payment> payments = paymentRepository.findAll();

                        Double totalSales = (payments == null) ? 0.0
                                        : payments.stream()
                                                        .filter(p -> p != null && p.getStatus() == PaymentStatus.PAID)
                                                        .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                                                        .sum();

                        Long customerCount = (users == null) ? 0L
                                        : users.stream()
                                                        .filter(u -> u != null && u.getRole() == Role.CUSTOMER)
                                                        .count();

                        Map<String, Double> monthlySalesMap = (orders == null) ? new HashMap<>()
                                        : orders.stream()
                                                        .filter(o -> o != null && o.getCreatedAt() != null)
                                                        .collect(Collectors.groupingBy(
                                                                        o -> o.getCreatedAt().getMonth().getDisplayName(
                                                                                        TextStyle.SHORT,
                                                                                        Locale.ENGLISH),
                                                                        Collectors.summingDouble(
                                                                                        o -> o.getTotal() != null
                                                                                                        ? o.getTotal()
                                                                                                        : 0.0)));

                        List<DashboardStatsResponse.MonthlySales> salesData = monthlySalesMap.entrySet().stream()
                                        .map(e -> new DashboardStatsResponse.MonthlySales(e.getKey(), e.getValue()))
                                        .sorted((a, b) -> {
                                                return a.getMonth().compareTo(b.getMonth());
                                        })
                                        .collect(Collectors.toList());

                        Map<String, Long> productSalesMap = (orders == null) ? new HashMap<>()
                                        : orders.stream()
                                                        .filter(o -> o != null && o.getItems() != null)
                                                        .flatMap(o -> o.getItems().stream())
                                                        .filter(item -> item != null && item.getProduct() != null)
                                                        .collect(Collectors.groupingBy(
                                                                        item -> item.getProduct().getName(),
                                                                        Collectors.summingLong(item -> item
                                                                                        .getQuantity() != null
                                                                                                        ? (long) item.getQuantity()
                                                                                                        : 0L)));

                        List<DashboardStatsResponse.TopProduct> topProducts = productSalesMap.entrySet().stream()
                                        .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                                        .limit(5)
                                        .map(e -> new DashboardStatsResponse.TopProduct(e.getKey(), e.getValue()))
                                        .collect(Collectors.toList());

                        DashboardStatsResponse response = DashboardStatsResponse.builder()
                                        .totalSales(totalSales)
                                        .totalOrders((long) (orders != null ? orders.size() : 0))
                                        .totalProducts((long) (products != null ? products.size() : 0))
                                        .totalUsers(customerCount)
                                        .salesData(salesData)
                                        .topProducts(topProducts)
                                        .build();

                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        return ResponseEntity.internalServerError().build();
                }
        }
}
