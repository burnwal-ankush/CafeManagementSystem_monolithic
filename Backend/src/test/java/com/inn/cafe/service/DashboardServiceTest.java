package com.inn.cafe.service;

import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.Dao.CategoryDao;
import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.serviceImpl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private CategoryDao categoryDao;
    @Mock private ProductDao productDao;
    @Mock private BillDao billDao;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getCount_ReturnsAllCounts() {
        when(categoryDao.count()).thenReturn(5L);
        when(productDao.count()).thenReturn(20L);
        when(billDao.count()).thenReturn(100L);

        ResponseEntity<Map<String, Object>> res = dashboardService.getCount();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(5L, res.getBody().get("category"));
        assertEquals(20L, res.getBody().get("product"));
        assertEquals(100L, res.getBody().get("bill"));
    }

    @Test
    void getCount_WhenException_ReturnsError() {
        when(categoryDao.count()).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<Map<String, Object>> res = dashboardService.getCount();
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
        assertTrue(res.getBody().isEmpty());
    }
}
