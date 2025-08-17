package com.inn.cafe.rest;

import com.inn.cafe.wrapper.ProductWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path = "/product")
public interface ProductRest {

    @PostMapping(path="/addProduct")
    ResponseEntity<String> addProduct(@RequestBody(required = true) Map<String,String> requestMap);

    @GetMapping(path="/getProduct")
    ResponseEntity<List<ProductWrapper>> getAllProduct();

    @PostMapping(path="/updateProduct")
    ResponseEntity<String> updateProduct(@RequestBody(required = true) Map<String,String> requestMap);

    @PostMapping(path="/deleteProduct/{id}")
    ResponseEntity<String> deleteProduct(@PathVariable Integer id);

    @PostMapping(path="/updateStatus")
    ResponseEntity<String> updateStatus(@RequestBody(required = true) Map<String,String> requestMap);

    @GetMapping(path="/getByCategory/{id}")
    ResponseEntity<List<ProductWrapper>> getByCategory(@PathVariable Integer id);

    @GetMapping(path="/getProductById/{id}")
    ResponseEntity<List<ProductWrapper>> getProductById(@PathVariable Integer id);

}
