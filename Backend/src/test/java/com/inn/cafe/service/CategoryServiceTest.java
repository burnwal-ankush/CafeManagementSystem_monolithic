package com.inn.cafe.service;

import com.inn.cafe.Dao.CategoryDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Category;
import com.inn.cafe.serviceImpl.CategoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryDao categoryDao;

    @Mock
    private JwtFilter jwtFilter;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void addNewCategory_ValidData_ReturnsSuccess() {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("name", "Test Category");

        when(jwtFilter.isAdmin()).thenReturn(true);
        when(categoryDao.existsByName("Test Category")).thenReturn(false);
        when(categoryDao.save(any(Category.class))).thenReturn(new Category());

        ResponseEntity<String> response = categoryService.addCategory(requestMap);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Successfully");
        verify(categoryDao).save(any(Category.class));
    }

    @Test
    void getAllCategory_ReturnsAllCategories() {
        Category category1 = new Category();
        category1.setId(1);
        category1.setName("Category 1");

        Category category2 = new Category();
        category2.setId(2);
        category2.setName("Category 2");

        when(categoryDao.findAll()).thenReturn(Arrays.asList(category1, category2));

        ResponseEntity<List<Category>> response = categoryService.getAllCategory("false");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        verify(categoryDao).findAll();
    }

    @Test
    void updateCategory_ValidData_ReturnsSuccess() {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("id", "1");
        requestMap.put("name", "Updated Category");

        Category existingCategory = new Category();
        existingCategory.setId(1);
        existingCategory.setName("Old Category");

        when(jwtFilter.isAdmin()).thenReturn(true);
        when(categoryDao.findById(1)).thenReturn(java.util.Optional.of(existingCategory));
        when(categoryDao.existsByName("Updated Category")).thenReturn(false);
        when(categoryDao.save(any(Category.class))).thenReturn(existingCategory);

        ResponseEntity<String> response = categoryService.updateCategory(requestMap);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Successfully");
        verify(categoryDao).save(any(Category.class));
    }

    @Test
    void updateCategory_InvalidId_ReturnsNotFound() {
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("id", "999");
        requestMap.put("name", "Updated Category");

        when(jwtFilter.isAdmin()).thenReturn(true);
        when(categoryDao.findById(999)).thenReturn(java.util.Optional.empty());

        ResponseEntity<String> response = categoryService.updateCategory(requestMap);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("does not exist");
        verify(categoryDao, never()).save(any(Category.class));
    }
}