package com.inn.cafe.config;

import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.Pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed admin
        if (userDao.findByEmailId("admin@cafe.com") == null) {
            User admin = new User();
            admin.setName("Admin");
            admin.setContactNumber("1234567890");
            admin.setEmail("admin@cafe.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatus("true");
            admin.setRole("admin");
            userDao.save(admin);
        }

        // Seed staff
        if (userDao.findByEmailId("user@cafe.com") == null) {
            User staff = new User();
            staff.setName("Staff User");
            staff.setContactNumber("9876543210");
            staff.setEmail("user@cafe.com");
            staff.setPassword(passwordEncoder.encode("user123"));
            staff.setStatus("true");
            staff.setRole("user");
            userDao.save(staff);
        }

        // Seed customer
        if (userDao.findByEmailId("customer@cafe.com") == null) {
            User customer = new User();
            customer.setName("Jane Customer");
            customer.setContactNumber("5551234567");
            customer.setEmail("customer@cafe.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setStatus("true");
            customer.setRole("customer");
            userDao.save(customer);
        }
    }
}
