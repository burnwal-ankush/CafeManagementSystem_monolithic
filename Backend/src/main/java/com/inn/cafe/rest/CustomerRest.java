package com.inn.cafe.rest;

import com.inn.cafe.Pojo.Bill;
import com.inn.cafe.Pojo.Rating;
import com.inn.cafe.wrapper.ProductWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path = "/customer")
public interface CustomerRest {

    @GetMapping(path = "/myOrders")
    ResponseEntity<List<Bill>> getMyOrders();

    @GetMapping(path = "/menu")
    ResponseEntity<List<ProductWrapper>> getMenu();

    @PostMapping(path = "/rate")
    ResponseEntity<String> addRating(@RequestBody Map<String, String> requestMap);

    @GetMapping(path = "/myRatings")
    ResponseEntity<List<Rating>> getMyRatings();

    @GetMapping(path = "/allRatings")
    ResponseEntity<List<Rating>> getAllRatings();

    @GetMapping(path = "/ratings/bill/{billId}")
    ResponseEntity<List<Rating>> getRatingsByBill(@PathVariable Integer billId);

    @GetMapping(path = "/ratings/product/{productId}")
    ResponseEntity<List<Rating>> getRatingsByProduct(@PathVariable Integer productId);
}
