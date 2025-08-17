package com.inn.cafe.security;

import com.inn.cafe.JWT.JWTUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JWTUtilsTest {

    private JWTUtils jwtUtils;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtils = new JWTUtils("testSecretKeyForJWTTokenGeneration123");
        userDetails = new User("test@example.com", "password", new ArrayList<>());
    }

    @Test
    void generateToken_ValidInput_ReturnsToken() {
        String token = jwtUtils.generateToken("test@example.com", "user");
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void extractUsername_ValidToken_ReturnsUsername() {
        String token = jwtUtils.generateToken("test@example.com", "user");
        
        String username = jwtUtils.extractUsername(token);
        
        assertEquals("test@example.com", username);
    }

    @Test
    void extractExpiration_ValidToken_ReturnsExpirationDate() {
        String token = jwtUtils.generateToken("test@example.com", "user");
        
        Date expiration = jwtUtils.extractExpiration(token);
        
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        String token = jwtUtils.generateToken("test@example.com", "user");
        
        Boolean isValid = jwtUtils.validateToken(token, userDetails);
        
        assertTrue(isValid);
    }

    @Test
    void validateToken_WrongUsername_ReturnsFalse() {
        String token = jwtUtils.generateToken("wrong@example.com", "user");
        
        Boolean isValid = jwtUtils.validateToken(token, userDetails);
        
        assertFalse(isValid);
    }

    @Test
    void validateToken_InvalidToken_ThrowsException() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> {
            jwtUtils.validateToken(invalidToken, userDetails);
        });
    }
}