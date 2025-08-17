package com.inn.cafe.service;

import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.CustomerUsersDetailService;
import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.serviceImpl.UserServiceImpl;
import com.inn.cafe.utils.EmailUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;


import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserDao userDao;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @Mock
    private CustomerUsersDetailService customerUsersDetailService;
    
    @Mock
    private JWTUtils jwtUtils;
    
    @Mock
    private EmailUtils emailUtils;
    
    @Mock
    private com.inn.cafe.JWT.JwtFilter jwtFilter;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole("user");
        testUser.setStatus("true");
    }

    @Test
    void signUp_ValidUser_ReturnsSuccess() {
        Map<String, String> requestMap = Map.of(
            "name", "Test User",
            "contactNumber", "1234567890",
            "email", "test@example.com",
            "password", "password"
        );

        when(userDao.findByEmailId(anyString())).thenReturn(null);
        when(userDao.save(any(User.class))).thenReturn(testUser);

        ResponseEntity<String> response = userService.signUp(requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userDao).save(any(User.class));
    }

    @Test
    void signUp_ExistingEmail_ReturnsError() {
        Map<String, String> requestMap = Map.of(
            "email", "test@example.com"
        );

        ResponseEntity<String> response = userService.signUp(requestMap);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void login_ValidCredentials_ReturnsToken() {
        Map<String, String> requestMap = Map.of(
            "email", "test@example.com",
            "password", "password"
        );

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(mockAuth);
        when(customerUsersDetailService.getUserDetail()).thenReturn(testUser);
        when(jwtUtils.generateToken(anyString(), anyString())).thenReturn("mock-jwt-token");

        ResponseEntity<String> response = userService.login(requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("token"));
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorized() {
        Map<String, String> requestMap = Map.of(
            "email", "test@example.com",
            "password", "wrongpassword"
        );

        when(authenticationManager.authenticate(any())).thenThrow(new RuntimeException());

        ResponseEntity<String> response = userService.login(requestMap);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}