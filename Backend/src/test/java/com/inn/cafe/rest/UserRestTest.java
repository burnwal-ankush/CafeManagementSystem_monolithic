package com.inn.cafe.rest;

import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.service.UserService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = UserRest.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
class UserRestTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JWTUtils jwtUtils;

    @MockBean
    private JwtFilter jwtFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void signUp_ValidRequest_ReturnsSuccess() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("name", "Test User");
        requestMap.put("email", "test@example.com");
        requestMap.put("password", "password");
        requestMap.put("contactNumber", "1234567890");

        when(userService.signUp(any())).thenReturn(ResponseEntity.ok("User registered successfully"));

        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }

    @Test
    void login_ValidCredentials_ReturnsToken() throws Exception {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("email", "test@example.com");
        requestMap.put("password", "password");

        when(userService.login(any())).thenReturn(ResponseEntity.ok("{\"token\":\"jwt-token\"}"));

        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk());
    }
}