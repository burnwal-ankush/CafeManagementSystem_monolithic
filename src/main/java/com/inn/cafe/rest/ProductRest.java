package com.inn.cafe.rest;

import com.inn.cafe.wrapper.ProductWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
}
