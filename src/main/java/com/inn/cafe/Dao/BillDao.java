package com.inn.cafe.Dao;

import com.inn.cafe.Pojo.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface BillDao extends JpaRepository<Bill, Integer> {
}
