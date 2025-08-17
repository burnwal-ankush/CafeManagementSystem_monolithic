package com.inn.cafe.utils;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CafeUtilsTest {

    @Test
    void getResponseEntity_ValidMessage_ReturnsOkResponse() {
        String message = "Test message";
        
        ResponseEntity<String> response = CafeUtils.getResponseEntity(message, HttpStatus.OK);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("{\"message\":\"Test message\"}", response.getBody());
    }

    @Test
    void getResponseEntity_ErrorMessage_ReturnsErrorResponse() {
        String message = "Error occurred";
        
        ResponseEntity<String> response = CafeUtils.getResponseEntity(message, HttpStatus.BAD_REQUEST);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("{\"message\":\"Error occurred\"}", response.getBody());
    }

    @Test
    void getUUID_ReturnsValidFormat() {
        String uuid = CafeUtils.getUUID();
        
        assertNotNull(uuid);
        assertTrue(uuid.startsWith("Bill-"));
        assertTrue(uuid.length() > 10);
    }

    @Test
    void getMapFromJson_ValidJson_ReturnsMap() {
        String jsonData = "{\"key1\":\"value1\",\"key2\":\"value2\"}";
        
        Map<String, Object> result = CafeUtils.getMapFromJson(jsonData);
        
        assertNotNull(result);
        assertEquals("value1", result.get("key1"));
        assertEquals("value2", result.get("key2"));
    }

    @Test
    void getMapFromJson_EmptyString_ReturnsEmptyMap() {
        Map<String, Object> result = CafeUtils.getMapFromJson("");
        
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void isFileExists_ValidPath_ReturnsBoolean() {
        String testPath = "/tmp/nonexistent.txt";
        
        Boolean result = CafeUtils.isFileExists(testPath);
        
        assertNotNull(result);
        assertFalse(result);
    }
}