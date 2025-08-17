package com.inn.cafe.rest;

import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.service.CategoryService;
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

@WebMvcTest(value = CategoryRest.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
class CategoryRestTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private JWTUtils jwtUtils;

    @MockBean
    private JwtFilter jwtFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addNewCategory_ValidRequest_ReturnsSuccess() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("name", "Test Category");

        when(categoryService.addCategory(any())).thenReturn(ResponseEntity.ok("Category Added Successfully"));

        mockMvc.perform(post("/category/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllCategory_ReturnsCategories() throws Exception {
        when(categoryService.getAllCategory(any())).thenReturn(ResponseEntity.ok(java.util.Collections.emptyList()));

        mockMvc.perform(get("/category/get"))
                .andExpect(status().isOk());
    }

    @Test
    void updateCategory_ValidRequest_ReturnsSuccess() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("id", "1");
        requestMap.put("name", "Updated Category");

        when(categoryService.updateCategory(any())).thenReturn(ResponseEntity.ok("Category Updated Successfully"));

        mockMvc.perform(post("/category/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }
}