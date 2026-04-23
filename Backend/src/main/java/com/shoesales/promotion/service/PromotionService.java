package com.shoesales.promotion.service;

import com.shoesales.promotion.dto.PromotionRequest;
import com.shoesales.promotion.dto.PromotionResponse;
import com.shoesales.promotion.entity.Promotion;
import com.shoesales.promotion.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public interface PromotionService {
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Long id, PromotionRequest request);
    List<PromotionResponse> getAllPromotions();
    List<PromotionResponse> getActivePromotions();
    PromotionResponse togglePromotionStatus(Long id);
    void deletePromotion(Long id);
}
