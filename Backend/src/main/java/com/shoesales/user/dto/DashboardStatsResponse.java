package com.shoesales.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private Double totalSales;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalUsers;
    private List<MonthlySales> salesData;
    private List<TopProduct> topProducts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySales {
        private String month;
        private Double sales;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private Long sales;
    }
}
