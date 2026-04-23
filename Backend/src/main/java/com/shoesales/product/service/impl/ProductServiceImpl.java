package com.shoesales.product.service.impl;

import com.shoesales.product.service.ProductService;

import com.shoesales.product.dto.ProductRequest;
import com.shoesales.product.dto.ProductResponse;
import com.shoesales.product.entity.Product;
import com.shoesales.product.repository.ProductRepository;
import com.shoesales.promotion.service.PromotionService;
import com.shoesales.promotion.dto.PromotionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Autowired
    private PromotionService promotionService;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .category(request.getCategory())
                .size(request.getSize())
                .color(request.getColor())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status("ACTIVE")
                .build();

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Product not found with ID " + id));

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setCategory(request.getCategory());
        product.setSize(request.getSize());
        product.setColor(request.getColor());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Error: Product not found with ID " + id);
        }
        productRepository.deleteById(id); // Hard delete — removes from DB
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Product not found with ID " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllActiveProducts(String category) {
        List<Product> products;
        if (category != null && !category.trim().isEmpty()) {
            products = productRepository.findByCategoryAndStatusIgnoreCaseTrimmed(category, "ACTIVE");
        } else {
            products = productRepository.findByStatus("ACTIVE");
        }
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        // Exclude any legacy soft-deleted records
        return productRepository.findAll().stream()
                .filter(p -> !"DELETED".equalsIgnoreCase(p.getStatus()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        Double originalPrice = product.getPrice();
        Double currentPrice = originalPrice;
        Double discount = null;

        List<PromotionResponse> activePromotions = promotionService.getActivePromotions();

        Optional<PromotionResponse> applicablePromo = activePromotions.stream()
                .filter(p -> p.getApplicableCategory() == null 
                             || p.getApplicableCategory().trim().isEmpty() 
                             || p.getApplicableCategory().equalsIgnoreCase(product.getCategory()))
                .max(Comparator.comparing(PromotionResponse::getDiscountPercentage));

        if (applicablePromo.isPresent()) {
            discount = applicablePromo.get().getDiscountPercentage();
            double factor = 1.0 - (discount / 100.0);
            currentPrice = Math.round(originalPrice * factor * 100.0) / 100.0;
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .category(product.getCategory())
                .size(product.getSize())
                .color(product.getColor())
                .price(currentPrice)
                .stockQuantity(product.getStockQuantity())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .originalPrice(originalPrice)
                .discount(discount)
                .build();
    }
}
