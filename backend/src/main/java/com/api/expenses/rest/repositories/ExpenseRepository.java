package com.api.expenses.rest.repositories;

import com.api.expenses.rest.models.Expense;
import org.hibernate.annotations.NamedNativeQuery;
import org.hibernate.annotations.NamedQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    public List<Expense> findByUserIdAndMonthAndYear(UUID userId, int month, int year);

    public List<Expense> findByUserIdAndYear(UUID userId, int year);

    public long countByCategoryId(int categoryId);

    @Query(value = "SELECT * FROM expenses WHERE user_id = ?1 AND month = ?2 AND year = ?3 AND category_id = ?4", nativeQuery = true)
    public List<Expense> findByUserIdAndMonthAndYearAndCategoryId(UUID userId, int month, int year, int categoryId);

    public List<Expense> findByUserIdAndWeekAndYear(UUID userId, int week, int year);

    public List<Expense> findByUserId(UUID userId);

    @Query(value = "SELECT * FROM expenses WHERE user_id = ?1 AND year = ?2 AND category_id = ?3", nativeQuery = true)
    public List<Expense> findByUserIdAndYearAndCategoryId(UUID userId, int year, int categoryId);

    @Query(value = "SELECT * FROM expenses WHERE user_id = ?1 AND week = ?2 AND year = ?3 AND category_id = ?4", nativeQuery = true)
    public List<Expense> findByUserIdAndWeekAndYearAndCategoryId(UUID userId, int week, int year, int categoryId);

    @Query(value = "SELECT * FROM expenses WHERE user_id = ?1 AND month = ?2 AND year = ?3 AND tag_id = ?4", nativeQuery = true)
    public List<Expense> findByUserIdAndMonthAndYearAndTagId(UUID userId, int month, int year, int tagId);
}
