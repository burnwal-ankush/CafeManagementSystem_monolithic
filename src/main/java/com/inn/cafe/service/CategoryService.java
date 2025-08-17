package com.inn.cafe.service;

import com.inn.cafe.Pojo.Category;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.List;

public interface CategoryService {
    ResponseEntity<String> addCategory(Map<String, String> requestMap);

    ResponseEntity<List<Category>> getAllCategory(String filterValue);

    ResponseEntity<String> updateCategory(Map<String, String> requestMap);
}
