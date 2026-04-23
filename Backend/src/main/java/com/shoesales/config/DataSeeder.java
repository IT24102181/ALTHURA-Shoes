package com.shoesales.config;

import com.shoesales.product.dto.ProductRequest;
import com.shoesales.product.dto.ProductResponse;
import com.shoesales.product.service.ProductService;
import com.shoesales.promotion.dto.PromotionRequest;
import com.shoesales.promotion.dto.PromotionResponse;
import com.shoesales.promotion.service.PromotionService;
import com.shoesales.user.dto.CreateUserRequest;
import com.shoesales.user.entity.Role;
import com.shoesales.user.entity.User;
import com.shoesales.user.service.UserService;
import com.shoesales.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final PromotionService promotionService;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataSeeder(
            UserService userService,
            UserRepository userRepository,
            ProductService productService,
            PromotionService promotionService,
            PasswordEncoder passwordEncoder,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.productService = productService;
        this.promotionService = promotionService;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        cleanupRequestedUsers();
        seedUsersIfMissing();
        seedProductsUpToMinimum(20);
        seedPromotionsUpToMinimum(3);
        log.info("Data seeding check completed.");
    }

    private void cleanupRequestedUsers() {
        List<String> emailsToRemove = List.of(
            "tharindu123@gmail.com", 
            "madhura@gmail.com", 
            "ravindu@gmail.com"
        );

        for (String email : emailsToRemove) {
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
            if (userOpt.isPresent()) {
                Long userId = userOpt.get().getId();
                log.info("Starting cleanup for requested user: {} (ID: {})", email, userId);
                try {
                    // 1. Delete associated data in correct order
                    // Delete Order Items
                    jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)", userId);
                    // Delete Payments
                    jdbcTemplate.update("DELETE FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)", userId);
                    // Delete Orders
                    jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", userId);
                    // Delete Cart Items
                    jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM carts WHERE user_id = ?)", userId);
                    // Delete Carts
                    jdbcTemplate.update("DELETE FROM carts WHERE user_id = ?", userId);
                    // Finally, delete the User
                    jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
                    
                    log.info("Successfully removed requested user and associated data: {}", email);
                } catch (Exception e) {
                    log.error("Failed to remove requested user: {}. Error: {}", email, e.getMessage());
                }
            }
        }
    }

    @Transactional
    protected void seedUsersIfMissing() {
        log.info("Checking/Encrypting user passwords...");
        
        // 1. Process all existing users to ensure they are encrypted
        List<User> allUsers = userRepository.findAll();
        long encryptedCount = 0;
        for (User user : allUsers) {
            String currentPassword = user.getPassword();
            // Check if the password already looks like a BCrypt hash
            if (currentPassword != null && !currentPassword.startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(currentPassword));
                userRepository.save(user);
                encryptedCount++;
            }
        }
        if (encryptedCount > 0) {
            log.info("Encrypted {} existing plain-text users.", encryptedCount);
        }
        
        // 2. Ensure default Seeded Users
        seedAdminUser("admin@althura.com");
        seedAdminUser("admin@altura.com");
        seedAdminUser("admin@shoesales.com");

        Optional<User> customerOpt = userRepository.findByEmailIgnoreCase("customer@shoesales.com");
        if (customerOpt.isEmpty()) {
            userService.createUser(CreateUserRequest.builder()
                    .firstName("John")
                    .lastName("Customer")
                    .email("customer@shoesales.com")
                    .password("Customer@123")
                    .role(Role.CUSTOMER)
                    .active(true)
                    .build());
            log.info("Seeded customer user.");
        } else {
            User customer = customerOpt.get();
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            userRepository.saveAndFlush(customer);
            log.info("Verified/Reset customer credentials.");
        }
    }

    private void seedAdminUser(String email) {
        Optional<User> adminOpt = userRepository.findByEmailIgnoreCase(email);
        if (adminOpt.isEmpty()) {
            userService.createUser(CreateUserRequest.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email(email)
                    .password("Admin@123")
                    .role(Role.ADMIN)
                    .active(true)
                    .build());
            log.info("Seeded admin user: {}", email);
        } else {
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.saveAndFlush(admin);
            log.info("Verified/Reset admin credentials for: {}", email);
        }
    }

    private void seedProductsUpToMinimum(int minimumCount) {
        List<ProductRequest> seedProducts = new ArrayList<>();

        seedProducts.add(buildProduct(
                "Nike Air Zoom Pegasus 40",
                "Nike",
                "Running",
                "10",
                "Black/White",
                129.99,
                40,
                "Daily running shoe with responsive cushioning.",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080"));
        seedProducts.add(buildProduct(
                "Adidas Ultraboost Light",
                "Adidas",
                "Running",
                "9",
                "Core Black",
                179.99,
                35,
                "Premium comfort sneaker for long-distance runs.",
                "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1080"));
        seedProducts.add(buildProduct(
                "Puma RS-X Heritage",
                "Puma",
                "Lifestyle",
                "8",
                "White/Blue",
                109.99,
                30,
                "Retro-inspired everyday sneaker.",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1080"));
        seedProducts.add(buildProduct(
                "New Balance 574 Core",
                "New Balance",
                "Lifestyle",
                "11",
                "Grey",
                89.99,
                25,
                "Classic style with durable materials.",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1080"));
        seedProducts.add(buildProduct(
                "ASICS Gel-Kayano 30",
                "ASICS",
                "Running",
                "10.5",
                "Navy/Orange",
                159.99,
                20,
                "Stability shoe for overpronation support.",
                "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1080"));
        seedProducts.add(buildProduct("Nike Air Max 270", "Nike", "Running", "10", "Black/White", 89.99, 38,
                "Visible cushioning under every step.",
                "https://images.unsplash.com/photo-1570051779696-244e9f680cf7?w=1080"));
        seedProducts.add(buildProduct("Adidas Ultraboost 22", "Adidas", "Running", "9", "Cloud White", 119.99, 34,
                "Made with recycled materials.",
                "https://images.unsplash.com/photo-1613972798457-45fc5237ae32?w=1080"));
        seedProducts.add(buildProduct("Puma RS-X", "Puma", "Lifestyle", "8", "Multicolor", 69.99, 31,
                "Reinvented Running System style.",
                "https://images.unsplash.com/photo-1614492056440-ee5bba048761?w=1080"));
        seedProducts.add(buildProduct("Jordan 1 Retro High", "Nike", "Basketball", "11", "Red/Black", 129.99, 22,
                "Classic basketball icon.",
                "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1080"));
        seedProducts.add(buildProduct("Converse Chuck Taylor", "Converse", "Lifestyle", "8", "Black", 49.99, 40,
                "Timeless high-top sneaker.",
                "https://images.unsplash.com/photo-1704489809293-ab95ce7f4491?w=1080"));
        seedProducts.add(buildProduct("Reebok Nano X3", "Reebok", "Training", "10", "Vector Navy", 99.99, 28,
                "Built for high-intensity training.",
                "https://images.unsplash.com/photo-1578765724997-d5d11d934aaf?w=1080"));
        seedProducts.add(buildProduct("Vans Old Skool", "Vans", "Lifestyle", "9", "Black/White", 59.99, 33,
                "Durable skate-inspired classic.",
                "https://images.unsplash.com/photo-1650371177125-fa1ecb155bed?w=1080"));
        seedProducts.add(buildProduct("Nike ZoomX Vaporfly", "Nike", "Running", "10.5", "Hyper Violet", 199.99, 18,
                "Race-day performance shoe.",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1080"));
        seedProducts.add(buildProduct("Adidas Stan Smith", "Adidas", "Lifestyle", "9", "White/Green", 75.00, 27,
                "Classic tennis-inspired silhouette.",
                "https://images.unsplash.com/photo-1518002171953-b0e6fa3e82cc?w=1080"));
        seedProducts.add(buildProduct("Puma Suede Classic", "Puma", "Lifestyle", "8", "Red/White", 65.00, 29,
                "Iconic suede street sneaker.",
                "https://images.unsplash.com/photo-1620138546344-7b2c38516fc5?w=1080"));
        seedProducts.add(buildProduct("Nike LeBron 20", "Nike", "Basketball", "11", "Violet", 160.00, 16,
                "Court-ready modern basketball shoe.",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1080"));
        seedProducts.add(buildProduct("Curry 10", "Under Armour", "Basketball", "10", "Yellow/Blue", 150.00, 15,
                "Responsive grip for quick cuts.",
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1080"));
        seedProducts.add(buildProduct("Gel-Kayano 29", "Asics", "Running", "10", "Blue", 140.00, 20,
                "Premium stability and comfort.",
                "https://images.unsplash.com/photo-1505784045224-1247b2b29cf3?w=1080"));
        seedProducts.add(buildProduct("Hoka Clifton 8", "Hoka", "Running", "9", "Orange", 130.00, 21,
                "Lightweight with soft cushioning.",
                "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1080"));
        seedProducts.add(buildProduct("Speedcross 6", "Salomon", "Running", "10", "Black", 140.00, 19,
                "Aggressive traction for trails.",
                "https://images.unsplash.com/photo-1584735174965-48c48d4db3b2?w=1080"));

        List<ProductResponse> existing = productService.getAllProducts();
        Set<String> existingNames = existing.stream()
                .map(ProductResponse::getName)
                .collect(Collectors.toSet());

        int inserted = 0;
        for (ProductRequest request : seedProducts) {
            if (existingNames.size() >= minimumCount) {
                break;
            }
            if (!existingNames.contains(request.getName())) {
                productService.createProduct(request);
                existingNames.add(request.getName());
                inserted++;
            }
        }
        log.info("Product seeding check: inserted={}, total={}", inserted, existingNames.size());
    }

    private void seedPromotionsUpToMinimum(int minimumCount) {
        LocalDateTime now = LocalDateTime.now();
        List<PromotionRequest> seedPromotions = new ArrayList<>();

        seedPromotions.add(buildPromotion(
                "Spring Launch Sale",
                "Get 15% off selected running shoes.",
                15.0,
                now.minusDays(1),
                now.plusDays(30),
                "SPRING15",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080"));
        seedPromotions.add(buildPromotion(
                "Weekend Flash Deal",
                "Flat 10% discount on all lifestyle products.",
                10.0,
                now.minusDays(1),
                now.plusDays(14),
                "FLASH10",
                "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1080"));
        seedPromotions.add(buildPromotion(
                "Member Exclusive",
                "Exclusive 20% discount for registered members.",
                20.0,
                now.minusDays(1),
                now.plusDays(60),
                "MEMBER20",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1080"));

        List<PromotionResponse> existing = promotionService.getAllPromotions();
        Set<String> existingTitles = existing.stream()
                .map(PromotionResponse::getTitle)
                .collect(Collectors.toSet());

        int inserted = 0;
        int updated = 0;

        for (PromotionRequest request : seedPromotions) {
            Optional<PromotionResponse> existingPromotionOpt = existing.stream()
                    .filter(p -> p.getTitle().equals(request.getTitle()))
                    .findFirst();

            if (existingPromotionOpt.isPresent()) {
                PromotionResponse p = existingPromotionOpt.get();
                if (p.getCode() == null || p.getImageUrl() == null) {
                    promotionService.updatePromotion(p.getId(), request);
                    updated++;
                }
            } else {
                if (existingTitles.size() < minimumCount) {
                    promotionService.createPromotion(request);
                    existingTitles.add(request.getTitle());
                    inserted++;
                }
            }
        }
        log.info("Promotion seeding check: inserted={}, updated={}, total={}", inserted, updated, existingTitles.size());
    }

    private ProductRequest buildProduct(
            String name,
            String brand,
            String category,
            String size,
            String color,
            Double price,
            Integer stockQuantity,
            String description,
            String imageUrl) {
        ProductRequest request = new ProductRequest();
        request.setName(name);
        request.setBrand(brand);
        request.setCategory(category);
        request.setSize(size);
        request.setColor(color);
        request.setPrice(price);
        request.setStockQuantity(stockQuantity);
        request.setDescription(description);
        request.setImageUrl(imageUrl);
        return request;
    }

    private PromotionRequest buildPromotion(
            String title,
            String description,
            Double discountPercentage,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String code,
            String imageUrl) {
        PromotionRequest request = new PromotionRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDiscountPercentage(discountPercentage);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setCode(code);
        request.setImageUrl(imageUrl);
        return request;
    }
}
