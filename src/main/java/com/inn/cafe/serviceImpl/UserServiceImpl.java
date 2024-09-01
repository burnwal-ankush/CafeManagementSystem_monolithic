package com.inn.cafe.serviceImpl;

import com.inn.cafe.Constants.CafeConstants;
import com.inn.cafe.Dao.UserDao;
import com.inn.cafe.JWT.CustomerUsersDetailService;
import com.inn.cafe.Pojo.User;
import com.inn.cafe.service.UserService;
import com.inn.cafe.utils.CafeUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserDao userDao;
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
    public ResponseEntity<String> signUp(Map<String, String> requestMap) {
        try {
            log.info("Inside signup with request: {}",requestMap );

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
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private boolean validate(Map<String, String> requestMap) {
        return requestMap.containsKey("name") &&
                requestMap.containsKey("contactNumber") &&
                requestMap.containsKey("email") &&
                requestMap.containsKey("password");
    }

    private User getUserFromMap(Map<String,String> requestMap)
    {
        User user = new User();
        user.setName(requestMap.get("name"));
        user.setContactNumber(requestMap.get("contactNumber"));
        user.setEmail(requestMap.get("email"));
        user.setPassword(requestMap.get("password"));
        user.setStatus("false");
        user.setRole("user");
        return user;
    }

}
