package com.shoesales.product.service;

import com.shoesales.product.dto.ProductRequest;
import com.shoesales.product.dto.ProductResponse;
import com.shoesales.product.entity.Product;
import com.shoesales.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getAllActiveProducts(String category);
    List<ProductResponse> getAllProducts();
}
