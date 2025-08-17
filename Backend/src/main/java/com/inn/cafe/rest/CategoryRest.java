package com.inn.cafe.rest;

import com.inn.cafe.Pojo.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path = "/category")
public interface CategoryRest {

    @PostMapping(path="/addCategory")
    ResponseEntity<String> addCategory(@RequestBody(required = true) Map<String,String> requestMap);

    @GetMapping(path="/getCategory")
    ResponseEntity<List<Category>> getAllCategory(@RequestParam(required = false) String filterValue);

    @PostMapping(path="/updateCategory")
    ResponseEntity<String> updateCategory(@RequestBody(required = true) Map<String,String> requestMap);

}
