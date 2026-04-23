package com.shoesales.product.repository;

import com.shoesales.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(String status);

    @Query("SELECT p FROM Product p WHERE LOWER(TRIM(p.category)) = LOWER(TRIM(:category)) AND p.status = :status")
    List<Product> findByCategoryAndStatusIgnoreCaseTrimmed(@Param("category") String category, @Param("status") String status);
}
