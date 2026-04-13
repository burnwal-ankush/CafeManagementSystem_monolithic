package com.inn.cafe.service;

import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.JWT.JwtFilter;
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

    @Mock private ProductDao productDao;
    @Mock private JwtFilter jwtFilter;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        Category cat = new Category(1, "Beverages");
        testProduct = new Product(1, "Coffee", cat, "Hot coffee", 4.99, "true");
    }

    @Test
    void addProduct_AsAdmin_ValidData_ReturnsSuccess() {
        Map<String, String> req = Map.of("name", "Coffee", "categoryId", "1", "description", "Hot", "price", "4.99");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.existsByName("Coffee")).thenReturn(false);
        when(productDao.save(any(Product.class))).thenReturn(testProduct);

        ResponseEntity<String> res = productService.addProduct(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void addProduct_DuplicateName_ReturnsBadRequest() {
        Map<String, String> req = Map.of("name", "Coffee", "categoryId", "1", "description", "Hot", "price", "4.99");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.existsByName("Coffee")).thenReturn(true);

        ResponseEntity<String> res = productService.addProduct(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void addProduct_AsNonAdmin_ReturnsUnauthorized() {
        Map<String, String> req = Map.of("name", "Coffee", "categoryId", "1", "description", "Hot", "price", "4.99");
        when(jwtFilter.isAdmin()).thenReturn(false);

        ResponseEntity<String> res = productService.addProduct(req);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    @Test
    void addProduct_MissingName_ReturnsBadRequest() {
        Map<String, String> req = Map.of("categoryId", "1", "price", "4.99");
        when(jwtFilter.isAdmin()).thenReturn(true);

        ResponseEntity<String> res = productService.addProduct(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void addProduct_DecimalPrice_ParsesCorrectly() {
        Map<String, String> req = Map.of("name", "Latte", "categoryId", "1", "description", "Creamy", "price", "5.50");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.existsByName("Latte")).thenReturn(false);
        when(productDao.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            assertEquals(5.50, p.getPrice());
            return p;
        });

        productService.addProduct(req);
        verify(productDao).save(any(Product.class));
    }

    @Test
    void getAllProduct_ReturnsList() {
        List<ProductWrapper> products = Arrays.asList(
            new ProductWrapper(1, "Coffee", "Hot", 4.99, "true", 1, "Beverages")
        );
        when(productDao.getAllProduct()).thenReturn(products);

        ResponseEntity<List<ProductWrapper>> res = productService.getAllProduct();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void updateProduct_AsAdmin_ValidData_ReturnsSuccess() {
        Map<String, String> req = Map.of("id", "1", "name", "Updated", "categoryId", "1", "description", "Upd", "price", "5.99");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(1)).thenReturn(Optional.of(testProduct));
        when(productDao.save(any(Product.class))).thenReturn(testProduct);

        ResponseEntity<String> res = productService.updateProduct(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void updateProduct_NonExistentId_ReturnsBadRequest() {
        Map<String, String> req = Map.of("id", "999", "name", "Updated", "categoryId", "1", "description", "Upd", "price", "5.99");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(999)).thenReturn(Optional.empty());

        ResponseEntity<String> res = productService.updateProduct(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void deleteProduct_AsAdmin_ValidId_ReturnsSuccess() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(1)).thenReturn(Optional.of(testProduct));

        ResponseEntity<String> res = productService.deleteProduct(1);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(productDao).deleteById(1);
    }

    @Test
    void deleteProduct_NonExistentId_ReturnsBadRequest() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(999)).thenReturn(Optional.empty());

        ResponseEntity<String> res = productService.deleteProduct(999);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void deleteProduct_AsNonAdmin_ReturnsUnauthorized() {
        when(jwtFilter.isAdmin()).thenReturn(false);
        ResponseEntity<String> res = productService.deleteProduct(1);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    @Test
    void updateStatus_AsAdmin_DifferentStatus_ReturnsSuccess() {
        Map<String, String> req = Map.of("id", "1", "status", "false");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(1)).thenReturn(Optional.of(testProduct));

        ResponseEntity<String> res = productService.updateStatus(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void updateStatus_SameStatus_ReturnsBadRequest() {
        Map<String, String> req = Map.of("id", "1", "status", "true");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(productDao.findById(1)).thenReturn(Optional.of(testProduct));

        ResponseEntity<String> res = productService.updateStatus(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void getByCategory_ReturnsList() {
        List<ProductWrapper> products = List.of(new ProductWrapper(1, "Coffee"));
        when(productDao.getProductByCategory(1)).thenReturn(products);

        ResponseEntity<List<ProductWrapper>> res = productService.getByCategory(1);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getProductById_ReturnsList() {
        List<ProductWrapper> products = List.of(new ProductWrapper(1, "Coffee", "Hot", 4.99));
        when(productDao.getProductById(1)).thenReturn(products);

        ResponseEntity<List<ProductWrapper>> res = productService.getProductById(1);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }
}
