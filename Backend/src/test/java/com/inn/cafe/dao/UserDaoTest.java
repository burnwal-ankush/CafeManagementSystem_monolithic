package com.inn.cafe.dao;

import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.Pojo.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserDaoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserDao userDao;

    @Test
    void findByEmailId_ExistingUser_ReturnsUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setContactNumber("1234567890");
        user.setStatus("true");
        user.setRole("user");
        
        entityManager.persistAndFlush(user);

        User found = userDao.findByEmailId("test@example.com");

        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("test@example.com");
        assertThat(found.getName()).isEqualTo("Test User");
    }

    @Test
    void findByEmailId_NonExistingUser_ReturnsNull() {
        User found = userDao.findByEmailId("nonexistent@example.com");
        assertThat(found).isNull();
    }
}