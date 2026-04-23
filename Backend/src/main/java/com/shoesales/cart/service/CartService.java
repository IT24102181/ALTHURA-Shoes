package com.shoesales.cart.service;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.stream.Collectors;

public interface CartService {
    CartResponse getCartByUserId(Long userId);
    CartResponse addToCart(Long userId, CartRequest request);
    CartResponse updateCartItemQuantity(Long userId, Long cartItemId, Integer newQuantity);
    CartResponse removeFromCart(Long userId, Long cartItemId);
    void clearCart(Long userId);
}
