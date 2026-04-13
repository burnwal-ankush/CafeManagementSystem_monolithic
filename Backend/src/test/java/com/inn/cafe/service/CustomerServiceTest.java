package com.inn.cafe.service;

import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.Dao.RatingDao;
import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Bill;
import com.inn.cafe.Pojo.Rating;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.restImpl.CustomerRestImpl;
import com.inn.cafe.wrapper.ProductWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private BillDao billDao;
    @Mock private ProductDao productDao;
    @Mock private RatingDao ratingDao;
    @Mock private UserDao userDao;
    @Mock private JwtFilter jwtFilter;

    @InjectMocks
    private CustomerRestImpl customerRest;

    private User testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new User();
        testCustomer.setId(1);
        testCustomer.setName("Jane");
        testCustomer.setEmail("jane@e.com");
        testCustomer.setRole("customer");
    }

    @Test
    void getMyOrders_ReturnsCustomerBills() {
        when(jwtFilter.getCurrentUser()).thenReturn("jane@e.com");
        Bill bill = new Bill();
        bill.setId(1);
        bill.setCreatedBy("jane@e.com");
        when(billDao.getBillByUserName("jane@e.com")).thenReturn(List.of(bill));

        ResponseEntity<List<Bill>> res = customerRest.getMyOrders();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getMenu_ReturnsActiveProducts() {
        ProductWrapper active = new ProductWrapper(1, "Coffee", "Hot", 4.99, "true", 1, "Bev");
        ProductWrapper inactive = new ProductWrapper(2, "Tea", "Cold", 2.99, "false", 1, "Bev");
        when(productDao.getAllProduct()).thenReturn(List.of(active, inactive));

        ResponseEntity<List<ProductWrapper>> res = customerRest.getMenu();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
        assertEquals("Coffee", res.getBody().get(0).getName());
    }

    @Test
    void addRating_GeneralReview_ReturnsSuccess() {
        Map<String, String> req = Map.of("score", "5", "comment", "Great!", "reviewType", "general");
        when(jwtFilter.getCurrentUser()).thenReturn("jane@e.com");
        when(userDao.findByEmail("jane@e.com")).thenReturn(testCustomer);
        when(ratingDao.save(any(Rating.class))).thenReturn(new Rating());

        ResponseEntity<String> res = customerRest.addRating(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(ratingDao).save(any(Rating.class));
    }

    @Test
    void addRating_BillReview_SetsBillId() {
        Map<String, String> req = Map.of("score", "4", "comment", "Good", "reviewType", "bill", "billId", "10");
        when(jwtFilter.getCurrentUser()).thenReturn("jane@e.com");
        when(userDao.findByEmail("jane@e.com")).thenReturn(testCustomer);
        when(ratingDao.save(any(Rating.class))).thenAnswer(inv -> {
            Rating r = inv.getArgument(0);
            assertEquals(10, r.getBillId());
            assertEquals("bill", r.getReviewType());
            return r;
        });

        customerRest.addRating(req);
        verify(ratingDao).save(any(Rating.class));
    }

    @Test
    void addRating_ProductReview_SetsProductFields() {
        Map<String, String> req = Map.of("score", "5", "comment", "Delicious", "reviewType", "product", "productId", "3", "productName", "Latte");
        when(jwtFilter.getCurrentUser()).thenReturn("jane@e.com");
        when(userDao.findByEmail("jane@e.com")).thenReturn(testCustomer);
        when(ratingDao.save(any(Rating.class))).thenAnswer(inv -> {
            Rating r = inv.getArgument(0);
            assertEquals(3, r.getProductId());
            assertEquals("Latte", r.getProductName());
            assertEquals("product", r.getReviewType());
            return r;
        });

        customerRest.addRating(req);
        verify(ratingDao).save(any(Rating.class));
    }

    @Test
    void getMyRatings_ReturnsCustomerRatings() {
        when(jwtFilter.getCurrentUser()).thenReturn("jane@e.com");
        Rating r = new Rating();
        r.setId(1);
        r.setScore(5);
        when(ratingDao.getByEmail("jane@e.com")).thenReturn(List.of(r));

        ResponseEntity<List<Rating>> res = customerRest.getMyRatings();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getAllRatings_ReturnsAll() {
        when(ratingDao.getAll()).thenReturn(List.of(new Rating(), new Rating()));

        ResponseEntity<List<Rating>> res = customerRest.getAllRatings();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(2, res.getBody().size());
    }

    @Test
    void getRatingsByBill_ReturnsBillRatings() {
        Rating r = new Rating();
        r.setBillId(5);
        when(ratingDao.getByBillId(5)).thenReturn(List.of(r));

        ResponseEntity<List<Rating>> res = customerRest.getRatingsByBill(5);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getRatingsByProduct_ReturnsProductRatings() {
        Rating r = new Rating();
        r.setProductId(3);
        when(ratingDao.getByProductId(3)).thenReturn(List.of(r));

        ResponseEntity<List<Rating>> res = customerRest.getRatingsByProduct(3);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }
}
