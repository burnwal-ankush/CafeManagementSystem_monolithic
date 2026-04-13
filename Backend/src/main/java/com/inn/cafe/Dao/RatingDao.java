package com.inn.cafe.Dao;

import com.inn.cafe.Pojo.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingDao extends JpaRepository<Rating, Integer> {
    List<Rating> getByEmail(@Param("email") String email);
    List<Rating> getAll();
}
