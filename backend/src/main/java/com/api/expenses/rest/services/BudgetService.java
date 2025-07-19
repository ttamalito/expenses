package com.api.expenses.rest.services;

import com.api.expenses.rest.models.Expense;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.dtos.BudgetBurndownDto;
import com.api.expenses.rest.models.dtos.BudgetBurndownDto.CategoryBurndownDto;
import com.api.expenses.rest.models.dtos.GetBudgetDto;
import com.api.expenses.rest.utils.DateUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final UserService userService;
    private final ExpenseService expenseService;

    @Autowired
    public BudgetService(UserService userService, ExpenseService expenseService) {
        this.userService = userService;
        this.expenseService = expenseService;
    }

    /**
     * Get the budget for a user
     * It will return the string representation of a JSON object with the budget for each category <br>
     * The JSON object will have the following format: <br>
     * [ <br>
     * { <br>
     * "id": 1, <br>
     * "name": "category name", <br>
     * "description": "category description", <br>
     * "userId": "user id", <br>
     * "budget": 100.00 <br>
     * }, <br>
     * { <br>
     * "id": 2, <br>
     * "name": "category name", <br>
     * "description": "category description", <br>
     * "userId": "user id", <br>
     * "budget": 200.00 <br>
     * } <br>
     * ] <br>
     *
     * @param userId the user id
     * @return a string representation of a JSON object with the budget for each category
     */
    public String getBudgetForUserAsJsonString(UUID userId) throws JsonProcessingException {
        List<ExpenseCategory> categories = userService.getUserExpenseCategories(userId);
        GetBudgetDto budgetDto = new GetBudgetDto(categories);
        String budgetDtoAsString = new ObjectMapper().writeValueAsString(budgetDto);
        return budgetDtoAsString;
    }


    private String convertExpenseCategoriesToJSON(List<ExpenseCategory> categories) {

        StringBuilder json = new StringBuilder();
        json.append("[");

        for (int i = 0; i < categories.size(); i++) {
            ExpenseCategory category = categories.get(i);
            json.append("{");
            json.append("\"id\":").append(category.getId()).append(",");
            json.append("\"name\":\"").append(category.getName()).append("\",");
            json.append("\"userId\":\"").append(category.getUserId()).append("\",");
            json.append("\"description\":\"").append(category.getDescription()).append("\",");
            json.append("\"budget\":").append(String.format("%.2f", category.getBudget()));
            json.append("}");
            if (i < categories.size() - 1) {
                json.append(",");
            }
        }

        json.append("]");

        return json.toString();
    }

    /**
     * Get budget burn-down data for a user for a specific month and year.
     * This data shows how the budget is being used throughout the month.
     *
     * @param userId the user ID
     * @param month the month (1-12)
     * @param year the year
     * @return a BudgetBurndownDto containing budget burn-down data for each category
     * @throws com.api.expenses.rest.exceptions.UserException if the user is not found
     */
    public BudgetBurndownDto getBudgetBurndown(UUID userId, int month, int year) throws com.api.expenses.rest.exceptions.UserException {
        // Get all expense categories with budgets for the user
        List<ExpenseCategory> categories = userService.getUserExpenseCategories(userId);

        // Get all expenses for the user for the specified month and year
        List<Expense> monthlyExpenses = expenseService.getExpensesForAMonthOfAUser(userId, month, year);

        // Calculate the number of days in the month
        YearMonth yearMonth = YearMonth.of(year, month);
        int daysInMonth = yearMonth.lengthOfMonth();

        // Create a list to hold category burn-down data
        List<CategoryBurndownDto> categoryBurndowns = new ArrayList<>();

        // Variables for "All Categories" calculation
        float totalBudget = 0f;
        float totalSpent = 0f;
        Map<Integer, Float> totalDailySpending = new HashMap<>();
        Map<Integer, Float> totalRemainingBudget = new HashMap<>();

        // Initialize with zero spending for all days in the total maps
        for (int day = 1; day <= daysInMonth; day++) {
            totalDailySpending.put(day, 0f);
            totalRemainingBudget.put(day, 0f);
        }

        // Process each category
        for (ExpenseCategory category : categories) {
            // Skip categories with no budget
            if (category.getBudget() <= 0) {
                continue;
            }

            // Filter expenses for this category
            List<Expense> categoryExpenses = monthlyExpenses.stream()
                .filter(expense -> expense.getCategoryId() == category.getId())
                .collect(Collectors.toList());

            // Calculate total spent for this category
            float categoryTotalSpent = categoryExpenses.stream()
                .map(Expense::getAmount)
                .reduce(0f, Float::sum);

            // Create maps for daily spending and remaining budget
            Map<Integer, Float> dailySpending = new HashMap<>();
            Map<Integer, Float> remainingBudget = new HashMap<>();

            // Initialize with zero spending for all days
            for (int day = 1; day <= daysInMonth; day++) {
                dailySpending.put(day, 0f);
            }

            // Calculate daily spending
            for (Expense expense : categoryExpenses) {
                Date expenseDate = expense.getDate();
                LocalDate localDate = expenseDate.toLocalDate();
                int day = localDate.getDayOfMonth();

                // Add expense amount to the corresponding day
                dailySpending.put(day, dailySpending.get(day) + expense.getAmount());

                // Also add to the total daily spending
                totalDailySpending.put(day, totalDailySpending.get(day) + expense.getAmount());
            }

            // Calculate remaining budget for each day
            float runningTotal = 0f;
            for (int day = 1; day <= daysInMonth; day++) {
                runningTotal += dailySpending.get(day);
                remainingBudget.put(day, category.getBudget() - runningTotal);
            }

            // Create CategoryBurndownDto
            CategoryBurndownDto categoryBurndown = new CategoryBurndownDto(
                category.getId(),
                category.getName(),
                category.getBudget(),
                categoryTotalSpent,
                dailySpending,
                remainingBudget
            );

            // Add to the list if there's spending in this category
            categoryBurndowns.add(categoryBurndown);

            // Update totals for "All Categories"
            totalBudget += category.getBudget();
            totalSpent += categoryTotalSpent;
        }

        // Calculate total remaining budget for each day
        float totalRunningSpent = 0f;
        for (int day = 1; day <= daysInMonth; day++) {
            totalRunningSpent += totalDailySpending.get(day);
            totalRemainingBudget.put(day, totalBudget - totalRunningSpent);
        }

        // Create "All Categories" burndown data
        CategoryBurndownDto allCategoriesBurndown = new CategoryBurndownDto(
            -1, // Special ID for "All Categories"
            "All Categories",
            totalBudget,
            totalSpent,
            totalDailySpending,
            totalRemainingBudget
        );

        // Add "All Categories" to the beginning of the list
        categoryBurndowns.add(0, allCategoriesBurndown);

        // Create and return BudgetBurndownDto
        return new BudgetBurndownDto(month, year, categoryBurndowns);
    }
}
