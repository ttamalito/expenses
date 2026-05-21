package com.api.expenses.rest.repositories;

import com.api.expenses.rest.models.Income;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
