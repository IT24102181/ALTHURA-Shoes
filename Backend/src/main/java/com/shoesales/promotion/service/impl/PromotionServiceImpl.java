package com.shoesales.promotion.service.impl;

import com.shoesales.promotion.service.PromotionService;

import com.shoesales.promotion.dto.PromotionRequest;
import com.shoesales.promotion.dto.PromotionResponse;
import com.shoesales.promotion.entity.Promotion;
import com.shoesales.promotion.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionServiceImpl(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .discountPercentage(request.getDiscountPercentage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .code(request.getCode())
                .imageUrl(request.getImageUrl())
                .applicableCategory(request.getApplicableCategory())
                .isActive(true)
                .build();

        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found"));

        promotion.setTitle(request.getTitle());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountPercentage(request.getDiscountPercentage());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setCode(request.getCode());
        promotion.setImageUrl(request.getImageUrl());
        promotion.setApplicableCategory(request.getApplicableCategory());

        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PromotionResponse> getActivePromotions() {
        // Auto-disable promotions that have passed the end of their end date
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> allActive = promotionRepository.findByIsActiveTrue();

        allActive.stream()
                // Treat endDate as end-of-day so promotions set to midnight aren't instantly expired
                .filter(p -> p.getEndDate().withHour(23).withMinute(59).withSecond(59).isBefore(now))
                .forEach(p -> {
                    p.setIsActive(false);
                    promotionRepository.save(p);
                });

        return promotionRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PromotionResponse togglePromotionStatus(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found"));

        promotion.setIsActive(!promotion.getIsActive());
        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found"));
        promotionRepository.delete(promotion);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .description(promotion.getDescription())
                .discountPercentage(promotion.getDiscountPercentage())
                .startDate(promotion.getStartDate().toString())
                .endDate(promotion.getEndDate().toString())
                .isActive(promotion.getIsActive())
                .code(promotion.getCode())
                .imageUrl(promotion.getImageUrl())
                .applicableCategory(promotion.getApplicableCategory())
                .build();
    }
}
