package com.inn.cafe.dao;

import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.Pojo.Product;
import com.inn.cafe.Pojo.Category;
import com.inn.cafe.wrapper.ProductWrapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProductDaoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductDao productDao;

    @Test
    void getAllProduct_ReturnsAllProducts() {
        Category category = new Category();
        category.setName("Test Category");
        entityManager.persistAndFlush(category);

        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(100);
        product.setDescription("Test Description");
        product.setStatus("true");
        product.setCategory(category);
        entityManager.persistAndFlush(product);

        List<ProductWrapper> products = productDao.getAllProduct();

        assertThat(products).isNotEmpty();
    }

    @Test
    void getProductByCategory_ReturnsFilteredProducts() {
        Category category = new Category();
        category.setName("Test Category");
        entityManager.persistAndFlush(category);

        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(100);
        product.setDescription("Test Description");
        product.setStatus("true");
        product.setCategory(category);
        entityManager.persistAndFlush(product);

        List<ProductWrapper> products = productDao.getProductByCategory(category.getId());

        assertThat(products).isNotEmpty();
    }
}