package com.inn.cafe.serviceImpl;

import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.Dao.CategoryDao;
import com.inn.cafe.Dao.ProductDao;
import com.inn.cafe.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    CategoryDao categoryDao;
    @Autowired
    ProductDao productDao;
    @Autowired
    BillDao billDao;


    @Override
    public ResponseEntity<Map<String, Object>> getCount() {
        try {
            Map<String, Object> dashboardMap = new HashMap<>();
            dashboardMap.put("category", categoryDao.count());
            dashboardMap.put("product", productDao.count());
            dashboardMap.put("bill", billDao.count());
            return new ResponseEntity<>(dashboardMap,HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new HashMap<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
