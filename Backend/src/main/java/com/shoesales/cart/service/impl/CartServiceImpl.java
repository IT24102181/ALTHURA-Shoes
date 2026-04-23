package com.shoesales.cart.service.impl;

import com.shoesales.cart.service.CartService;

import com.shoesales.cart.dto.CartRequest;
import com.shoesales.cart.dto.CartItemResponse;
import com.shoesales.cart.dto.CartResponse;
import com.shoesales.cart.entity.Cart;
import com.shoesales.cart.entity.CartItem;
import com.shoesales.product.entity.Product;
import com.shoesales.user.entity.User;
import com.shoesales.cart.repository.CartRepository;
import com.shoesales.product.repository.ProductRepository;
import com.shoesales.user.repository.UserRepository;
import com.shoesales.promotion.service.PromotionService;
import com.shoesales.promotion.dto.PromotionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromotionService promotionService;

    @Transactional
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, CartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Error: Product not found"));

        if (!"ACTIVE".equals(product.getStatus())) {
            throw new RuntimeException("Error: Product is not available");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Error: Not enough stock");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                        (request.getSize() == null || request.getSize().equals(item.getSize())))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .size(request.getSize())
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long userId, Long cartItemId, Integer newQuantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Cart Item not found"));

        if (newQuantity <= 0) {
            cart.getItems().remove(itemToUpdate);
        } else {
            if (itemToUpdate.getProduct().getStockQuantity() < newQuantity) {
                throw new RuntimeException("Error: Not enough stock");
            }
            itemToUpdate.setQuantity(newQuantity);
        }

        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));

        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Error: User not found"));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    private CartResponse mapToResponse(Cart cart) {
        List<PromotionResponse> activePromotions = promotionService.getActivePromotions();

        var itemResponses = cart.getItems().stream().map(item -> {
            Product product = item.getProduct();
            Double price = product.getPrice();
            Integer quantity = item.getQuantity();
            Double subTotal = price * quantity;
            
            Double discountedPrice = price;
            Double discountedSubTotal = subTotal;
            String appliedPromoTitle = null;

            Optional<PromotionResponse> applicablePromo = activePromotions.stream()
                .filter(p -> p.getApplicableCategory() == null 
                             || p.getApplicableCategory().trim().isEmpty() 
                             || p.getApplicableCategory().equalsIgnoreCase(product.getCategory()))
                .max(Comparator.comparing(PromotionResponse::getDiscountPercentage));

            if (applicablePromo.isPresent()) {
                PromotionResponse promo = applicablePromo.get();
                double discountFactor = 1.0 - (promo.getDiscountPercentage() / 100.0);
                discountedPrice = Math.round(price * discountFactor * 100.0) / 100.0;
                discountedSubTotal = discountedPrice * quantity;
                appliedPromoTitle = promo.getTitle() + " (" + promo.getDiscountPercentage() + "% OFF)";
            }

            return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .price(price)
                .size(item.getSize())
                .quantity(quantity)
                .subTotal(subTotal)
                .discountedPrice(discountedPrice)
                .discountedSubTotal(discountedSubTotal)
                .appliedPromotionTitle(appliedPromoTitle)
                .build();
        }).collect(Collectors.toList());

        double originalTotal = itemResponses.stream().mapToDouble(CartItemResponse::getSubTotal).sum();
        double total = itemResponses.stream().mapToDouble(CartItemResponse::getDiscountedSubTotal).sum();
        double discountTotal = Math.round((originalTotal - total) * 100.0) / 100.0;

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .total(total)
                .originalTotal(originalTotal)
                .discountTotal(discountTotal)
                .build();
    }
}
