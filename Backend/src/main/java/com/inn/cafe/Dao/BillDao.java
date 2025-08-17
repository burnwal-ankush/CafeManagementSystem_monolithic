package com.inn.cafe.Dao;

import com.inn.cafe.Pojo.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillDao extends JpaRepository<Bill, Integer> {
    List<Bill> getAllBills();
    List<Bill> getBillByUserName(@Param("username") String username);
}
