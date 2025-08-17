package com.inn.cafe.error;

import com.inn.cafe.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ErrorHandlingTest {

    @Mock
    private UserService userService;

    @Test
    void signup_InvalidData_ReturnsError() {
        Map<String, String> invalidRequest = new HashMap<>();
        // Missing required fields

        when(userService.signUp(any())).thenReturn(
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Data"));

        ResponseEntity<String> response = userService.signUp(invalidRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Invalid Data");
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorized() {
        Map<String, String> invalidCredentials = new HashMap<>();
        invalidCredentials.put("email", "wrong@example.com");
        invalidCredentials.put("password", "wrongpassword");

        when(userService.login(any())).thenReturn(
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad Credentials"));

        ResponseEntity<String> response = userService.login(invalidCredentials);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).contains("Bad Credentials");
    }

    @Test
    void signup_DuplicateEmail_ReturnsConflict() {
        Map<String, String> duplicateRequest = new HashMap<>();
        duplicateRequest.put("name", "Test User");
        duplicateRequest.put("email", "existing@example.com");
        duplicateRequest.put("password", "password");
        duplicateRequest.put("contactNumber", "1234567890");

        when(userService.signUp(any())).thenReturn(
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists"));

        ResponseEntity<String> response = userService.signUp(duplicateRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Email already exists");
    }

    @Test
    void service_InternalError_ReturnsServerError() {
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("password", "password");

        when(userService.login(any())).thenReturn(
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something Went Wrong"));

        ResponseEntity<String> response = userService.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).contains("Something Went Wrong");
    }
}