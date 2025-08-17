package com.inn.cafe.rest;

import com.inn.cafe.Pojo.Bill;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path = "/bill")
public interface BillRest {

    @PostMapping(path="/generateBill")
    ResponseEntity<String> generateBill(@RequestBody(required = true) Map<String,Object> requestMap);

    @GetMapping(path="/getBills")
    ResponseEntity<List<Bill>> getBills();

    @PostMapping(path="/getPdf")
    ResponseEntity<byte[]> getPdf(@RequestBody(required = true) Map<String,Object> requestMap);

    @PostMapping(path="/deleteBill/{id}")
    ResponseEntity<String> deleteBill(@PathVariable Integer id);
}
