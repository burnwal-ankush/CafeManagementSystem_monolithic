package com.inn.cafe.serviceImpl;

import com.google.common.base.Strings;
import com.inn.cafe.Constants.CafeConstants;
import com.inn.cafe.Dao.CategoryDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Category;
import com.inn.cafe.service.CategoryService;
import com.inn.cafe.utils.CafeUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class CategoryServiceImpl implements CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);

    @Autowired
    private CategoryDao categoryDao;

    @Autowired
    private JwtFilter jwtFilter;

    @Override
    public ResponseEntity<List<Category>> getAllCategory(String filterValue) {
        try {
            if (!Strings.isNullOrEmpty(filterValue) && filterValue.equalsIgnoreCase("true")) {
                log.info("Fetching filtered categories");
                return new ResponseEntity<>(categoryDao.getAllCategory(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(categoryDao.findAll(), HttpStatus.OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> addCategory(Map<String, String> requestMap) {
        try {
            if (jwtFilter.isAdmin()) {
                if (validateCategoryMap(requestMap, false)) {
                    String categoryName = requestMap.get("name");
                    if (categoryDao.existsByName(categoryName)) {
                        return CafeUtils.getResponseEntity("Category with the same name already exists!", HttpStatus.BAD_REQUEST);
                    }
                    categoryDao.save(getCategoryFromMap(requestMap, false));
                    return CafeUtils.getResponseEntity("Category Added Successfully!!!", HttpStatus.OK);
                }
                return CafeUtils.getResponseEntity(CafeConstants.INVALID_DATA, HttpStatus.BAD_REQUEST);
            }
            return CafeUtils.getResponseEntity(CafeConstants.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            e.printStackTrace();
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> updateCategory(Map<String, String> requestMap) {
        try {
            if (jwtFilter.isAdmin()) {
                if (validateCategoryMap(requestMap, true)) {
                    Optional<Category> categoryOptional = categoryDao.findById(Integer.parseInt(requestMap.get("id")));
                    if (categoryOptional.isPresent()) {
                        Category existingCategory = categoryOptional.get();
                        String newName = requestMap.get("name");

                        if (!existingCategory.getName().equalsIgnoreCase(newName) && categoryDao.existsByName(newName)) {
                            return CafeUtils.getResponseEntity("Category name already exists!", HttpStatus.BAD_REQUEST);
                        } else if (existingCategory.getName().equalsIgnoreCase(newName)) {
                            return CafeUtils.getResponseEntity("Category name already exists!", HttpStatus.BAD_REQUEST);
                        }
                        else {
                            categoryDao.save(getCategoryFromMap(requestMap, true));
                            return CafeUtils.getResponseEntity("Successfully updated category!!!", HttpStatus.OK);
                        }
                    } else {
                        return CafeUtils.getResponseEntity("Category does not exist with the given ID", HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return CafeUtils.getResponseEntity(CafeConstants.INVALID_DATA, HttpStatus.BAD_REQUEST);
                }
            } else {
                return CafeUtils.getResponseEntity(CafeConstants.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private boolean validateCategoryMap(Map<String, String> requestMap, Boolean validateId) {
        if (requestMap.containsKey("name")) {
            if (validateId) {
                try {
                    Integer.parseInt(requestMap.get("id"));
                    return true;
                } catch (NumberFormatException e) {
                    return false;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    private Category getCategoryFromMap(Map<String, String> requestMap, Boolean isUpdate) {
        Category category = new Category();
        if (isUpdate) {
            category.setId(Integer.parseInt(requestMap.get("id")));
        }
        category.setName(requestMap.get("name"));
        return category;
    }
}
