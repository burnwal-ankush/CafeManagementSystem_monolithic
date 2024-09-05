package com.inn.cafe.Dao;

import com.inn.cafe.Pojo.Product;
import com.inn.cafe.wrapper.ProductWrapper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDao extends JpaRepository<Product,Integer> {
    List<ProductWrapper> getAllProduct();

    boolean existsByName(String productNameName);
}
