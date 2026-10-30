package com.api.expenses.rest.repositories;

import com.api.expenses.rest.models.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface IncomeRepository extends JpaRepository<Income, Integer> {

    public List<Income> findByUserIdAndMonthAndYear(UUID userId, int month, int year);

    public List<Income> findByUserIdAndYear(UUID userId, int year);

    public long countByCategoryId(int categoryId);

    public long countByTagId(int tagId);

    public List<Income> findByUserIdAndMonthAndYearAndCategoryId(UUID userId, int month, int year, int categoryId);

    public List<Income> findByUserIdAndWeekAndYear(UUID userId, int week, int year);

    public List<Income> findByUserId(UUID userId);

    @Modifying
    @Query(value = "UPDATE incomes SET category_id = ?2 WHERE category_id = ?1", nativeQuery = true)
    void updateCategoryForIncomes(int oldCategoryId, int newCategoryId);
}
