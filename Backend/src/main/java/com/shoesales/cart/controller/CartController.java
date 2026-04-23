package com.shoesales.cart.controller;

import com.shoesales.cart.dto.CartRequest;
import com.shoesales.cart.dto.CartResponse;
import com.shoesales.config.UserDetailsImpl;
import com.shoesales.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<CartResponse> getMyCart() {
        return ResponseEntity.ok(cartService.getCartByUserId(getCurrentUserId()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(getCurrentUserId(), request));
    }

    @PutMapping("/item/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(getCurrentUserId(), itemId, quantity));
    }

    @DeleteMapping("/item/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<CartResponse> removeFromCart(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeFromCart(getCurrentUserId(), itemId));
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart(getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}
