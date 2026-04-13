package com.inn.cafe.serviceImpl;

import com.google.common.base.Strings;
import com.inn.cafe.Constants.CafeConstants;
import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.CustomerUsersDetailService;
import com.inn.cafe.JWT.JWTUtils;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.service.UserService;
import com.inn.cafe.utils.CafeUtils;
import com.inn.cafe.utils.EmailUtils;
import com.inn.cafe.wrapper.UserWrapper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.HashMap;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserDao userDao;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    CustomerUsersDetailService customerUsersDetailService;
    @Autowired
    JWTUtils jwtUtils;
    @Autowired
    JwtFilter jwtFilter;
    @Autowired
    EmailUtils emailUtils;

    @Autowired
    org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
    public ResponseEntity<String> signUp(Map<String, String> requestMap) {
        try {
            log.info("Inside signup with request: {}", requestMap);

            if (validate(requestMap)) {
                User user = userDao.findByEmailId(requestMap.get("email"));

                if (Objects.isNull(user)) {
                    userDao.save(getUserFromMap(requestMap));
                    return CafeUtils.getResponseEntity("Successfully registered!!!", HttpStatus.OK);
                } else {
                    return CafeUtils.getResponseEntity("Email already exists!!!", HttpStatus.BAD_REQUEST);
                }
            } else {
                return CafeUtils.getResponseEntity(CafeConstants.INVALID_DATA, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            log.error("Exception in signUp: ", e);
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean validate(Map<String, String> requestMap) {
        return requestMap.containsKey("name") &&
                requestMap.containsKey("contactNumber") &&
                requestMap.containsKey("email") &&
                requestMap.containsKey("password");
    }

    private User getUserFromMap(Map<String, String> requestMap) {
        User user = new User();
        user.setName(requestMap.get("name"));
        user.setContactNumber(requestMap.get("contactNumber"));
        user.setEmail(requestMap.get("email"));
        user.setPassword(passwordEncoder.encode(requestMap.get("password")));
        user.setStatus("true");
        // Public signup always creates customers; staff/admin created by admin
        user.setRole("customer");
        return user;
    }

    @Override
    public ResponseEntity<String> login(Map<String, String> requestMap) {
        log.info("Inside login");
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestMap.get("email"), requestMap.get("password"))
            );
            if (auth.isAuthenticated()) {
                if ("true".equalsIgnoreCase(customerUsersDetailService.getUserDetail().getStatus())) {

                    return new ResponseEntity<String>(
                            "{\"token\":\"" + jwtUtils.generateToken(
                                    customerUsersDetailService.getUserDetail().getEmail(),
                                    customerUsersDetailService.getUserDetail().getRole()) + "\"}",
                            HttpStatus.OK);
                } else {
                    return CafeUtils.getResponseEntity("Please wait for Admin to Approve!!!", HttpStatus.BAD_REQUEST);
                }
            }
        } catch (Exception e) {
            log.error("Exception during login: ", e);
        }
        return CafeUtils.getResponseEntity("Wrong Credentials!!!", HttpStatus.BAD_REQUEST);
    }

    @Override
    public ResponseEntity<List<UserWrapper>> getAllUsers() {
        try {
            if (jwtFilter.isAdmin()) {
                log.info("User is admin, hence returning users");
                List<UserWrapper> users = userDao.getAllNonAdminUsers();
                log.info("Successfully got {} users",users.size());
                return new ResponseEntity<>(users, HttpStatus.OK);
            } else {
                log.info("User is not admin, hence can't return any users");
                return new ResponseEntity<>(new ArrayList<>(), HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> update(Map<String, String> requestMap) {
        try{
            if(jwtFilter.isAdmin())
            {
                Optional<User> optionalUser = userDao.findById(Integer.parseInt(requestMap.get("id")));
                if(!optionalUser.isEmpty())
                {
                    userDao.updateStatus(requestMap.get("status"),Integer.parseInt(requestMap.get("id")));
                    sendMailToAllAdmin(requestMap.get("status"),optionalUser.get().getEmail(),userDao.getAllAdmin());
                    return CafeUtils.getResponseEntity("User status updated successfully!!!", HttpStatus.OK);
                }
                else {
                    return CafeUtils.getResponseEntity("User does not exist with id", HttpStatus.OK);
                }
            }
            else {
                return CafeUtils.getResponseEntity(CafeConstants.UNAUTHORIZED_ACCESS,HttpStatus.UNAUTHORIZED);
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity<String> checkToken() {
        return CafeUtils.getResponseEntity("true",HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> changePassword(Map<String, String> requestMap) {
        try{
            User userObj = userDao.findByEmail(jwtFilter.getCurrentUser());
            if(userObj != null)
            {
                if(passwordEncoder.matches(requestMap.get("oldPassword"), userObj.getPassword()) && !((requestMap.get("oldPassword")).equals(requestMap.get("newPassword"))))
                {
                    userObj.setPassword(passwordEncoder.encode(requestMap.get("newPassword")));
                    userDao.save(userObj);
                    return CafeUtils.getResponseEntity("Password updated successfully", HttpStatus.OK);
                }
                else if(requestMap.get("oldPassword").equals(requestMap.get("newPassword"))) {
                    return CafeUtils.getResponseEntity("New password cannot be same as Old password", HttpStatus.BAD_REQUEST);
                }
                else {
                     return CafeUtils.getResponseEntity("Incorrect Old Password", HttpStatus.BAD_REQUEST);
                }
            }
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity<String> forgotPassword(Map<String, String> requestMap) {
        try{
            User user = userDao.findByEmail(requestMap.get("email"));
            if(!Objects.isNull(user) && !Strings.isNullOrEmpty(user.getEmail()))
            {
                emailUtils.forgotMail(user.getEmail(),"Credentials by Cafe Management System", user.getPassword());
            }
            CafeUtils.getResponseEntity("Please check for your mail for credentials",HttpStatus.OK);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private void sendMailToAllAdmin(String status, String user, List<String> allAdmin) {

        allAdmin.remove(jwtFilter.getCurrentUser());
        if(status!=null && status.equalsIgnoreCase("true"))
        {
            emailUtils.sendSimpleMessage(jwtFilter.getCurrentUser(),"ACCOUNT APPROVED", "USER :- " +user + "\n is approved by \nADMIN:-" +jwtFilter.getCurrentUser() ,allAdmin);
        }
        else {
            emailUtils.sendSimpleMessage(jwtFilter.getCurrentUser(),"ACCOUNT DISABLED", "USER :- " +user + "\n is disabled by \nADMIN:-" +jwtFilter.getCurrentUser() ,allAdmin);
        }
    }

    @Override
    public ResponseEntity<String> addStaff(Map<String, String> requestMap) {
        try {
            if (jwtFilter.isAdmin()) {
                if (validate(requestMap)) {
                    User existing = userDao.findByEmailId(requestMap.get("email"));
                    if (Objects.isNull(existing)) {
                        User user = new User();
                        user.setName(requestMap.get("name"));
                        user.setContactNumber(requestMap.get("contactNumber"));
                        user.setEmail(requestMap.get("email"));
                        user.setPassword(passwordEncoder.encode(requestMap.get("password")));
                        user.setStatus("true");
                        user.setRole("user");
                        userDao.save(user);
                        return CafeUtils.getResponseEntity("Staff member added successfully!", HttpStatus.OK);
                    } else {
                        return CafeUtils.getResponseEntity("Email already exists!", HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return CafeUtils.getResponseEntity(CafeConstants.INVALID_DATA, HttpStatus.BAD_REQUEST);
                }
            } else {
                return CafeUtils.getResponseEntity(CafeConstants.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity<String> updateRole(Map<String, String> requestMap) {
        try {
            if (jwtFilter.isAdmin()) {
                Integer id = Integer.parseInt(requestMap.get("id"));
                String role = requestMap.get("role");
                if ("user".equals(role) || "customer".equals(role)) {
                    Optional<User> optionalUser = userDao.findById(id);
                    if (optionalUser.isPresent()) {
                        userDao.updateRole(role, id);
                        return CafeUtils.getResponseEntity("Role updated successfully!", HttpStatus.OK);
                    } else {
                        return CafeUtils.getResponseEntity("User not found", HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return CafeUtils.getResponseEntity("Invalid role", HttpStatus.BAD_REQUEST);
                }
            } else {
                return CafeUtils.getResponseEntity(CafeConstants.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity<Map<String, String>> getProfile() {
        try {
            User user = userDao.findByEmail(jwtFilter.getCurrentUser());
            if (user != null) {
                Map<String, String> profile = new HashMap<>();
                profile.put("name", user.getName());
                profile.put("email", user.getEmail());
                profile.put("contactNumber", user.getContactNumber());
                profile.put("role", user.getRole());
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(new HashMap<>(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    public ResponseEntity<String> updateProfile(Map<String, String> requestMap) {
        try {
            User user = userDao.findByEmail(jwtFilter.getCurrentUser());
            if (user != null) {
                if (requestMap.containsKey("name")) user.setName(requestMap.get("name"));
                if (requestMap.containsKey("contactNumber")) user.setContactNumber(requestMap.get("contactNumber"));
                userDao.save(user);
                return CafeUtils.getResponseEntity("Profile updated successfully!", HttpStatus.OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
