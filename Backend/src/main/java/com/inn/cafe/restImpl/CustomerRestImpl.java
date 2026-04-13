package com.inn.cafe.restImpl;

import com.inn.cafe.Constants.CafeConstants;
import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.Dao.RatingDao;
import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Bill;
import com.inn.cafe.Pojo.Rating;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.rest.CustomerRest;
import com.inn.cafe.utils.CafeUtils;
import com.inn.cafe.wrapper.ProductWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class CustomerRestImpl implements CustomerRest {

    @Autowired
    private BillDao billDao;
    @Autowired
    private ProductDao productDao;
    @Autowired
    private RatingDao ratingDao;
    @Autowired
    private UserDao userDao;
    @Autowired
    private JwtFilter jwtFilter;

    @Override
    public ResponseEntity<List<Bill>> getMyOrders() {
        try {
            String email = jwtFilter.getCurrentUser();
            List<Bill> bills = billDao.getBillByUserName(email);
            return new ResponseEntity<>(bills, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<ProductWrapper>> getMenu() {
        try {
            List<ProductWrapper> products = productDao.getAllProduct();
            List<ProductWrapper> active = products.stream()
                    .filter(p -> "true".equalsIgnoreCase(p.getStatus()))
                    .toList();
            return new ResponseEntity<>(active, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> addRating(Map<String, String> requestMap) {
        try {
            String email = jwtFilter.getCurrentUser();
            User user = userDao.findByEmail(email);

            Rating rating = new Rating();
            rating.setCustomerEmail(email);
            rating.setCustomerName(user != null ? user.getName() : "Customer");
            rating.setScore(Integer.parseInt(requestMap.get("score")));
            rating.setComment(requestMap.getOrDefault("comment", ""));
            rating.setCreatedAt(LocalDateTime.now());

            String type = requestMap.getOrDefault("reviewType", "general");
            rating.setReviewType(type);

            if ("bill".equals(type) && requestMap.containsKey("billId")) {
                rating.setBillId(Integer.parseInt(requestMap.get("billId")));
            }
            if ("product".equals(type) && requestMap.containsKey("productId")) {
                rating.setProductId(Integer.parseInt(requestMap.get("productId")));
                rating.setProductName(requestMap.getOrDefault("productName", ""));
            }

            ratingDao.save(rating);
            return CafeUtils.getResponseEntity("Review submitted successfully!", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<Rating>> getMyRatings() {
        try {
            String email = jwtFilter.getCurrentUser();
            return new ResponseEntity<>(ratingDao.getByEmail(email), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<Rating>> getAllRatings() {
        try {
            return new ResponseEntity<>(ratingDao.getAll(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<Rating>> getRatingsByBill(Integer billId) {
        try {
            return new ResponseEntity<>(ratingDao.getByBillId(billId), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<Rating>> getRatingsByProduct(Integer productId) {
        try {
            return new ResponseEntity<>(ratingDao.getByProductId(productId), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
