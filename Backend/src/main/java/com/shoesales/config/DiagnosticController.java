package com.shoesales.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostics")
public class DiagnosticController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/schema/promotions")
    public List<Map<String, Object>> getPromotionsSchema() {
        return jdbcTemplate.queryForList("DESCRIBE promotions");
    }

    @GetMapping("/schema/products")
    public List<Map<String, Object>> getProductsSchema() {
        return jdbcTemplate.queryForList("DESCRIBE products");
    }

    @GetMapping("/data/promotions")
    public List<Map<String, Object>> getPromotionsData() {
        return jdbcTemplate.queryForList("SELECT * FROM promotions LIMIT 5");
    }

    @GetMapping("/data/products")
    public List<Map<String, Object>> getProductsData() {
        return jdbcTemplate.queryForList("SELECT * FROM products LIMIT 5");
    }

    @GetMapping("/counts")
    public Map<String, Object> getCounts() {
        return Map.of(
                "products", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM products", Integer.class),
                "promotions", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM promotions", Integer.class));
    }

    @PutMapping("/fix/products-status")
    public Map<String, Object> fixProductsStatus() {
        int updated = jdbcTemplate.update("UPDATE products SET status = 'ACTIVE' WHERE status IS NULL OR status = ''");
        return Map.of("updated", updated, "message", "Set " + updated + " products to ACTIVE status");
    }
}
