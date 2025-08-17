package com.inn.cafe.security;

import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.CustomerUsersDetailService;
import com.inn.cafe.Pojo.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerUsersDetailServiceTest {

    @Mock
    private UserDao userDao;

    @InjectMocks
    private CustomerUsersDetailService customerUsersDetailService;

    @Test
    void loadUserByUsername_ExistingUser_ReturnsUserDetails() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password");

        when(userDao.findByEmailId("test@example.com")).thenReturn(user);

        UserDetails userDetails = customerUsersDetailService.loadUserByUsername("test@example.com");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("test@example.com");
        assertThat(userDetails.getPassword()).isEqualTo("password");
    }

    @Test
    void loadUserByUsername_NonExistingUser_ThrowsException() {
        when(userDao.findByEmailId("nonexistent@example.com")).thenReturn(null);

        assertThrows(UsernameNotFoundException.class, 
            () -> customerUsersDetailService.loadUserByUsername("nonexistent@example.com"));
    }

    @Test
    void getUserDetail_ReturnsStoredUser() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password");

        when(userDao.findByEmailId("test@example.com")).thenReturn(user);
        customerUsersDetailService.loadUserByUsername("test@example.com");

        User result = customerUsersDetailService.getUserDetail();
        assertThat(result).isEqualTo(user);
    }
}