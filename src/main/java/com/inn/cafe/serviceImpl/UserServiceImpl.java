package com.inn.cafe.serviceImpl;

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
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;
import java.util.concurrent.ExecutionException;

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
        user.setPassword(requestMap.get("password"));
        user.setStatus("false");
        user.setRole("user");
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
                List<UserWrapper> users = userDao.getAllUsers();
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

    private void sendMailToAllAdmin(String status, String user, List<String> allAdmin) {

        allAdmin.remove(jwtFilter.currentUser());
        if(status!=null && status.equalsIgnoreCase("true"))
        {
            emailUtils.sendSimpleMessage(jwtFilter.currentUser(),"ACCOUNT APPROVED", "USER :- " +user + "\n is approved by \nADMIN:-" +jwtFilter.currentUser() ,allAdmin);
        }
        else {
            emailUtils.sendSimpleMessage(jwtFilter.currentUser(),"ACCOUNT DISABLED", "USER :- " +user + "\n is disabled by \nADMIN:-" +jwtFilter.currentUser() ,allAdmin);
        }
    }


}
