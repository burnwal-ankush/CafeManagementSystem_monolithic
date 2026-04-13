package com.inn.cafe.service;

import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Bill;
import com.inn.cafe.serviceImpl.BillServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock private BillDao billDao;
    @Mock private JwtFilter jwtFilter;

    @InjectMocks
    private BillServiceImpl billService;

    private Bill testBill;

    @BeforeEach
    void setUp() {
        testBill = new Bill();
        testBill.setId(1);
        testBill.setUuid("Bill-20260414");
        testBill.setName("Customer");
        testBill.setEmail("c@e.com");
        testBill.setContactNumber("123");
        testBill.setPaymentMethod("Cash");
        testBill.setTotal(25.50);
        testBill.setProductDetail("[{\"name\":\"Coffee\",\"quantity\":2}]");
        testBill.setCreatedBy("c@e.com");
    }

    @Test
    void getBills_AsAdmin_ReturnsAllBills() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(billDao.getAllBills()).thenReturn(List.of(testBill));

        ResponseEntity<List<Bill>> res = billService.getBills();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getBills_AsUser_ReturnsOwnBills() {
        when(jwtFilter.isAdmin()).thenReturn(false);
        when(jwtFilter.getCurrentUser()).thenReturn("c@e.com");
        when(billDao.getBillByUserName("c@e.com")).thenReturn(List.of(testBill));

        ResponseEntity<List<Bill>> res = billService.getBills();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void deleteBill_AsAdmin_ValidId_ReturnsSuccess() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(billDao.findById(1)).thenReturn(Optional.of(testBill));

        ResponseEntity<String> res = billService.deleteBill(1);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(billDao).deleteById(1);
    }

    @Test
    void deleteBill_AsAdmin_InvalidId_ReturnsError() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(billDao.findById(999)).thenReturn(Optional.empty());

        ResponseEntity<String> res = billService.deleteBill(999);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertTrue(res.getBody().contains("does not exist"));
    }

    @Test
    void deleteBill_AsNonAdmin_ReturnsUnauthorized() {
        when(jwtFilter.isAdmin()).thenReturn(false);
        ResponseEntity<String> res = billService.deleteBill(1);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    @Test
    void generateBill_MissingFields_ReturnsBadRequest() {
        java.util.Map<String, Object> req = new java.util.HashMap<>();
        req.put("name", "Test");
        // Missing other required fields

        ResponseEntity<String> res = billService.generateBill(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }
}
