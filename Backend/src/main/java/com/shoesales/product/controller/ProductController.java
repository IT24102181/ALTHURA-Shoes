package com.shoesales.product.controller;

import com.shoesales.product.dto.ProductRequest;
import com.shoesales.auth.dto.MessageResponse;
import com.shoesales.product.dto.ProductResponse;
import com.shoesales.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.shoesales.product.repository.ProductRepository productRepository;

    @Autowired
    private com.shoesales.promotion.repository.PromotionRepository promotionRepository;

    @GetMapping("/debug/counts")
    public ResponseEntity<String> getDbCounts() {
        return ResponseEntity
                .ok("Products: " + productRepository.count() + " | Promotions: " + promotionRepository.count());
    }

    // Public Endpoint: Everyone can view active products
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllActiveProducts(
            @RequestParam(name = "category", required = false) String category) {
        List<ProductResponse> products = productService.getAllActiveProducts(category);
        System.out.println("Products count: " + products.size());
        return ResponseEntity.ok(products);
    }

    // Public Endpoint
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Admin Endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable(name = "id") Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable(name = "id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }
}
