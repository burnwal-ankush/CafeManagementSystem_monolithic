package com.inn.cafe.service;

import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.Pojo.Category;
import com.inn.cafe.Pojo.Product;
import com.inn.cafe.serviceImpl.ProductServiceImpl;
import com.inn.cafe.wrapper.ProductWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductDao productDao;
    
    @Mock
    private com.inn.cafe.JWT.JwtFilter jwtFilter;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product testProduct;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1);
        testCategory.setName("Beverages");

        testProduct = new Product();
        testProduct.setId(1);
        testProduct.setName("Coffee");
        testProduct.setDescription("Hot coffee");
        testProduct.setPrice(100);
        testProduct.setStatus("true");
        testProduct.setCategory(testCategory);
    }

    @Test
    void addNewProduct_ValidProduct_ReturnsSuccess() {
        Map<String, String> requestMap = Map.of(
            "name", "Coffee",
            "categoryId", "1",
            "description", "Hot coffee",
            "price", "100"
        );

        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.save(any(Product.class))).thenReturn(testProduct);

        ResponseEntity<String> response = productService.addProduct(requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(productDao).save(any(Product.class));
    }

    @Test
    void getAllProduct_ReturnsProductList() {
        List<ProductWrapper> mockProducts = Arrays.asList(
            new ProductWrapper(1, "Coffee", "Hot coffee", 100, "true", 1, "Beverages")
        );

        when(productDao.getAllProduct()).thenReturn(mockProducts);

        ResponseEntity<List<ProductWrapper>> response = productService.getAllProduct();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Coffee", response.getBody().get(0).getName());
    }

    @Test
    void updateProduct_ValidProduct_ReturnsSuccess() {
        Map<String, String> requestMap = Map.of(
            "id", "1",
            "name", "Updated Coffee",
            "categoryId", "1",
            "description", "Updated description",
            "price", "120"
        );

        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(anyInt())).thenReturn(Optional.of(testProduct));
        when(productDao.save(any(Product.class))).thenReturn(testProduct);

        ResponseEntity<String> response = productService.updateProduct(requestMap);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteProduct_ValidId_ReturnsSuccess() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(anyInt())).thenReturn(Optional.of(testProduct));

        ResponseEntity<String> response = productService.deleteProduct(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(productDao).deleteById(1);
    }

    @Test
    void deleteProduct_InvalidId_ReturnsError() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(anyInt())).thenReturn(Optional.empty());

        ResponseEntity<String> response = productService.deleteProduct(999);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}