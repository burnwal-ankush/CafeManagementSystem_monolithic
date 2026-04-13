package com.inn.cafe.service;

import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.CustomerUsersDetailService;
import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.serviceImpl.UserServiceImpl;
import com.inn.cafe.utils.EmailUtils;
import com.inn.cafe.wrapper.UserWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserDao userDao;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private CustomerUsersDetailService customerUsersDetailService;
    @Mock private JWTUtils jwtUtils;
    @Mock private EmailUtils emailUtils;
    @Mock private JwtFilter jwtFilter;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setContactNumber("1234567890");
        testUser.setRole("user");
        testUser.setStatus("true");
    }

    // --- signUp tests ---

    @Test
    void signUp_ValidUser_ReturnsSuccess() {
        Map<String, String> req = Map.of("name", "Test", "contactNumber", "123", "email", "test@example.com", "password", "pass");
        when(userDao.findByEmailId("test@example.com")).thenReturn(null);
        when(passwordEncoder.encode("pass")).thenReturn("encodedPass");
        when(userDao.save(any(User.class))).thenReturn(testUser);

        ResponseEntity<String> res = userService.signUp(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(userDao).save(any(User.class));
    }

    @Test
    void signUp_ExistingEmail_ReturnsBadRequest() {
        Map<String, String> req = Map.of("name", "Test", "contactNumber", "123", "email", "test@example.com", "password", "pass");
        when(userDao.findByEmailId("test@example.com")).thenReturn(testUser);

        ResponseEntity<String> res = userService.signUp(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertTrue(res.getBody().contains("Email already exists"));
    }

    @Test
    void signUp_MissingFields_ReturnsBadRequest() {
        Map<String, String> req = Map.of("email", "test@example.com");
        ResponseEntity<String> res = userService.signUp(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void signUp_DefaultsToCustomerRole() {
        Map<String, String> req = Map.of("name", "Test", "contactNumber", "123", "email", "new@example.com", "password", "pass");
        when(userDao.findByEmailId("new@example.com")).thenReturn(null);
        when(passwordEncoder.encode("pass")).thenReturn("enc");
        when(userDao.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertEquals("customer", u.getRole());
            return u;
        });

        userService.signUp(req);
        verify(userDao).save(any(User.class));
    }

    // --- login tests ---

    @Test
    void login_ValidCredentials_ReturnsToken() {
        Map<String, String> req = Map.of("email", "test@example.com", "password", "pass");
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(mockAuth);
        when(customerUsersDetailService.getUserDetail()).thenReturn(testUser);
        when(jwtUtils.generateToken("test@example.com", "user")).thenReturn("jwt-token");

        ResponseEntity<String> res = userService.login(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertTrue(res.getBody().contains("token"));
    }

    @Test
    void login_InactiveUser_ReturnsBadRequest() {
        testUser.setStatus("false");
        Map<String, String> req = Map.of("email", "test@example.com", "password", "pass");
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(mockAuth);
        when(customerUsersDetailService.getUserDetail()).thenReturn(testUser);

        ResponseEntity<String> res = userService.login(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertTrue(res.getBody().contains("Admin to Approve"));
    }

    @Test
    void login_BadCredentials_ReturnsBadRequest() {
        Map<String, String> req = Map.of("email", "test@example.com", "password", "wrong");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad"));

        ResponseEntity<String> res = userService.login(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertTrue(res.getBody().contains("Wrong Credentials"));
    }

    // --- getAllUsers ---

    @Test
    void getAllUsers_AsAdmin_ReturnsUsers() {
        when(jwtFilter.isAdmin()).thenReturn(true);
        List<UserWrapper> users = List.of(new UserWrapper(1, "Test", "123", "t@e.com", "true", "user"));
        when(userDao.getAllNonAdminUsers()).thenReturn(users);

        ResponseEntity<List<UserWrapper>> res = userService.getAllUsers();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(1, res.getBody().size());
    }

    @Test
    void getAllUsers_AsNonAdmin_ReturnsUnauthorized() {
        when(jwtFilter.isAdmin()).thenReturn(false);
        ResponseEntity<List<UserWrapper>> res = userService.getAllUsers();
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    // --- update (status) ---

    @Test
    void update_AsAdmin_ValidUser_ReturnsSuccess() {
        Map<String, String> req = new HashMap<>(Map.of("id", "1", "status", "true"));
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(userDao.findById(1)).thenReturn(Optional.of(testUser));
        when(userDao.getAllAdmin()).thenReturn(new ArrayList<>());

        ResponseEntity<String> res = userService.update(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void update_AsNonAdmin_ReturnsUnauthorized() {
        Map<String, String> req = Map.of("id", "1", "status", "true");
        when(jwtFilter.isAdmin()).thenReturn(false);
        ResponseEntity<String> res = userService.update(req);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    // --- checkToken ---

    @Test
    void checkToken_ReturnsTrue() {
        ResponseEntity<String> res = userService.checkToken();
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    // --- changePassword ---

    @Test
    void changePassword_ValidOldPassword_ReturnsSuccess() {
        Map<String, String> req = Map.of("oldPassword", "oldPass", "newPassword", "newPass");
        testUser.setPassword("encodedOld");
        when(jwtFilter.getCurrentUser()).thenReturn("test@example.com");
        when(userDao.findByEmail("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("oldPass", "encodedOld")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNew");

        ResponseEntity<String> res = userService.changePassword(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(userDao).save(any(User.class));
    }

    @Test
    void changePassword_WrongOldPassword_ReturnsBadRequest() {
        Map<String, String> req = Map.of("oldPassword", "wrong", "newPassword", "newPass");
        testUser.setPassword("encodedOld");
        when(jwtFilter.getCurrentUser()).thenReturn("test@example.com");
        when(userDao.findByEmail("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("wrong", "encodedOld")).thenReturn(false);

        ResponseEntity<String> res = userService.changePassword(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void changePassword_SamePassword_ReturnsBadRequest() {
        Map<String, String> req = Map.of("oldPassword", "same", "newPassword", "same");
        testUser.setPassword("encodedSame");
        when(jwtFilter.getCurrentUser()).thenReturn("test@example.com");
        when(userDao.findByEmail("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("same", "encodedSame")).thenReturn(true);

        ResponseEntity<String> res = userService.changePassword(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    // --- addStaff ---

    @Test
    void addStaff_AsAdmin_ValidData_ReturnsSuccess() {
        Map<String, String> req = Map.of("name", "Staff", "contactNumber", "123", "email", "staff@e.com", "password", "pass");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(userDao.findByEmailId("staff@e.com")).thenReturn(null);
        when(passwordEncoder.encode("pass")).thenReturn("enc");
        when(userDao.save(any(User.class))).thenReturn(testUser);

        ResponseEntity<String> res = userService.addStaff(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void addStaff_ExistingEmail_ReturnsBadRequest() {
        Map<String, String> req = Map.of("name", "Staff", "contactNumber", "123", "email", "test@example.com", "password", "pass");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(userDao.findByEmailId("test@example.com")).thenReturn(testUser);

        ResponseEntity<String> res = userService.addStaff(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    @Test
    void addStaff_AsNonAdmin_ReturnsUnauthorized() {
        Map<String, String> req = Map.of("name", "Staff", "contactNumber", "123", "email", "s@e.com", "password", "p");
        when(jwtFilter.isAdmin()).thenReturn(false);
        ResponseEntity<String> res = userService.addStaff(req);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    // --- updateRole ---

    @Test
    void updateRole_AsAdmin_ValidRole_ReturnsSuccess() {
        Map<String, String> req = Map.of("id", "1", "role", "user");
        when(jwtFilter.isAdmin()).thenReturn(true);
        when(userDao.findById(1)).thenReturn(Optional.of(testUser));

        ResponseEntity<String> res = userService.updateRole(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void updateRole_InvalidRole_ReturnsBadRequest() {
        Map<String, String> req = Map.of("id", "1", "role", "admin");
        when(jwtFilter.isAdmin()).thenReturn(true);

        ResponseEntity<String> res = userService.updateRole(req);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    }

    // --- getProfile ---

    @Test
    void getProfile_ReturnsUserData() {
        when(jwtFilter.getCurrentUser()).thenReturn("test@example.com");
        when(userDao.findByEmail("test@example.com")).thenReturn(testUser);

        ResponseEntity<Map<String, String>> res = userService.getProfile();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals("Test User", res.getBody().get("name"));
        assertEquals("test@example.com", res.getBody().get("email"));
    }

    // --- updateProfile ---

    @Test
    void updateProfile_ValidData_ReturnsSuccess() {
        Map<String, String> req = Map.of("name", "New Name", "contactNumber", "999");
        when(jwtFilter.getCurrentUser()).thenReturn("test@example.com");
        when(userDao.findByEmail("test@example.com")).thenReturn(testUser);

        ResponseEntity<String> res = userService.updateProfile(req);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        verify(userDao).save(any(User.class));
    }
}
