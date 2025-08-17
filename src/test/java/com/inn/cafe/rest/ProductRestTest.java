package com.inn.cafe.rest;

import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ProductRest.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
class ProductRestTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private JWTUtils jwtUtils;

    @MockBean
    private JwtFilter jwtFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addNewProduct_ValidRequest_ReturnsSuccess() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("name", "Test Product");
        requestMap.put("categoryId", "1");
        requestMap.put("description", "Test Description");
        requestMap.put("price", "100");

        when(productService.addProduct(any())).thenReturn(ResponseEntity.ok("Product added successfully"));

        mockMvc.perform(post("/product/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllProduct_ReturnsProductList() throws Exception {
        when(productService.getAllProduct()).thenReturn(ResponseEntity.ok(java.util.Collections.emptyList()));

        mockMvc.perform(get("/product/get"))
                .andExpect(status().isOk());
    }

    @Test
    void updateProduct_ValidRequest_ReturnsSuccess() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("id", "1");
        requestMap.put("name", "Updated Product");
        requestMap.put("price", "150");

        when(productService.updateProduct(any())).thenReturn(ResponseEntity.ok("Product updated successfully"));

        mockMvc.perform(post("/product/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteProduct_ValidId_ReturnsSuccess() throws Exception {
        when(productService.deleteProduct(1)).thenReturn(ResponseEntity.ok("Product deleted successfully"));

        mockMvc.perform(post("/product/delete/1"))
                .andExpect(status().isOk());
    }
}