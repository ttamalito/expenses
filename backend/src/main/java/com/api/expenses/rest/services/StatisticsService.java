package com.api.expenses.rest.services;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.api.expenses.rest.models.Expense;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.dtos.StatisticalSummaryDto;
import com.api.expenses.rest.models.dtos.StatisticalSummaryDto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final BudgetService budgetService;
    private final UserService userService;

    @Autowired
    public StatisticsService(ExpenseService expenseService, IncomeService incomeService, 
                            BudgetService budgetService, UserService userService) {
        this.expenseService = expenseService;
        this.incomeService = incomeService;
        this.budgetService = budgetService;
        this.userService = userService;
    }

    /**
     * Get statistical summaries for a user.
     *
     * @param userId the user ID
     * @return a StatisticalSummaryDto containing various financial statistics
     * @throws UserException if the user is not found
     * @throws TransactionException if there's an error processing the data
     */
    public StatisticalSummaryDto getStatisticalSummary(UUID userId) throws UserException, TransactionException {
        // Validate user exists
        userService.getUserById(userId).orElseThrow(() -> new UserException(UserException.UserExceptionType.USER_NOT_FOUND));

        // Get all expenses for the user
        List<Expense> allExpenses = expenseService.getAllExpensesOfAUser(userId);
        
        // Calculate highest spending statistics
        HighestSpendingDto highestSpending = calculateHighestSpending(userId, allExpenses);
        
        // Calculate savings statistics
        SavingsDto savings = calculateSavings(userId);
        
        // Calculate average spending statistics
        AverageSpendingDto averageSpending = calculateAverageSpending(userId, allExpenses);
        
        // Calculate budget streak statistics
        BudgetStreakDto budgetStreak = calculateBudgetStreak(userId);
        
        // Create and return the complete DTO
        return new StatisticalSummaryDto(
            highestSpending,
            savings,
            averageSpending,
            budgetStreak
        );
    }

    /**
     * Calculate highest spending day, month, and category.
     */
    private HighestSpendingDto calculateHighestSpending(UUID userId, List<Expense> allExpenses) throws TransactionException {
        // Find highest spending day
        DaySpendingDto highestSpendingDay = findHighestSpendingDay(allExpenses);
        
        // Find highest spending month
        MonthSpendingDto highestSpendingMonth = findHighestSpendingMonth(userId);
        
        // Find highest spending category
        CategorySpendingDto highestSpendingCategory = findHighestSpendingCategory(userId, allExpenses);
        
        return new HighestSpendingDto(
            highestSpendingDay,
            highestSpendingMonth,
            highestSpendingCategory
        );
    }

    /**
     * Find the day with the highest total spending.
     */
    private DaySpendingDto findHighestSpendingDay(List<Expense> allExpenses) {
        // Group expenses by date and sum amounts
        Map<Date, Float> dailyTotals = new HashMap<>();
        
        for (Expense expense : allExpenses) {
            Date date = expense.getDate();
            dailyTotals.put(date, dailyTotals.getOrDefault(date, 0f) + expense.getAmount());
        }
        
        // Find the date with the highest total
        Map.Entry<Date, Float> highestEntry = null;
        for (Map.Entry<Date, Float> entry : dailyTotals.entrySet()) {
            if (highestEntry == null || entry.getValue() > highestEntry.getValue()) {
                highestEntry = entry;
            }
        }
        
        // If no expenses, return null values
        if (highestEntry == null) {
            return new DaySpendingDto("N/A", 0f);
        }
        
        // Format the date as a string
        String dateStr = highestEntry.getKey().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        
        return new DaySpendingDto(dateStr, highestEntry.getValue());
    }

    /**
     * Find the month with the highest total spending.
     */
    private MonthSpendingDto findHighestSpendingMonth(UUID userId) throws TransactionException {
        // Get current year and previous year
        int currentYear = LocalDate.now().getYear();
        int previousYear = currentYear - 1;
        
        // Check last 24 months (2 years)
        float highestAmount = 0f;
        int highestMonth = 0;
        int highestYear = 0;
        
        // Check current year
        for (int month = 1; month <= 12; month++) {
            try {
                float total = expenseService.getTotalSpentForAMonthOfAUser(userId, month, currentYear);
                if (total > highestAmount) {
                    highestAmount = total;
                    highestMonth = month;
                    highestYear = currentYear;
                }
            } catch (Exception e) {
                // Skip if no data for this month
            }
        }
        
        // Check previous year
        for (int month = 1; month <= 12; month++) {
            try {
                float total = expenseService.getTotalSpentForAMonthOfAUser(userId, month, previousYear);
                if (total > highestAmount) {
                    highestAmount = total;
                    highestMonth = month;
                    highestYear = previousYear;
                }
            } catch (Exception e) {
                // Skip if no data for this month
            }
        }
        
        // If no expenses found, return default values
        if (highestMonth == 0) {
            return new MonthSpendingDto(0, 0, 0f);
        }
        
        return new MonthSpendingDto(highestMonth, highestYear, highestAmount);
    }

    /**
     * Find the category with the highest total spending.
     */
    private CategorySpendingDto findHighestSpendingCategory(UUID userId, List<Expense> allExpenses) throws TransactionException {
        // Get all expense categories for the user
        List<ExpenseCategory> categories = userService.getUserExpenseCategories(userId);
        
        // Calculate total spent per category
        Map<Integer, Float> categoryTotals = new HashMap<>();
        Map<Integer, String> categoryNames = new HashMap<>();
        
        // Populate category names map
        for (ExpenseCategory category : categories) {
            categoryNames.put(category.getId(), category.getName());
        }
        
        // Calculate totals
        for (Expense expense : allExpenses) {
            int categoryId = expense.getCategoryId();
            categoryTotals.put(categoryId, categoryTotals.getOrDefault(categoryId, 0f) + expense.getAmount());
        }
        
        // Find the category with the highest total
        Map.Entry<Integer, Float> highestEntry = null;
        for (Map.Entry<Integer, Float> entry : categoryTotals.entrySet()) {
            if (highestEntry == null || entry.getValue() > highestEntry.getValue()) {
                highestEntry = entry;
            }
        }
        
        // If no expenses, return null values
        if (highestEntry == null) {
            return new CategorySpendingDto(0, "N/A", 0f);
        }
        
        int categoryId = highestEntry.getKey();
        String categoryName = categoryNames.getOrDefault(categoryId, "Unknown");
        
        return new CategorySpendingDto(categoryId, categoryName, highestEntry.getValue());
    }

    /**
     * Calculate savings statistics.
     */
    private SavingsDto calculateSavings(UUID userId) throws TransactionException {
        // Get current year and previous year
        int currentYear = LocalDate.now().getYear();
        int previousYear = currentYear - 1;
        
        // Calculate monthly savings percentages for the last 24 months
        Map<String, Float> monthlySavingsPercentage = new HashMap<>();
        float totalSavingsRate = 0f;
        int monthsWithData = 0;
        
        // Process current and previous year
        for (int year : new int[]{currentYear, previousYear}) {
            for (int month = 1; month <= 12; month++) {
                try {
                    float income = incomeService.getTotalEarnedForAMonthForAUser(userId, month, year);
                    float expenses = expenseService.getTotalSpentForAMonthOfAUser(userId, month, year);
                    
                    // Skip months with no income
                    if (income <= 0) {
                        continue;
                    }
                    
                    float savings = income - expenses;
                    float savingsPercentage = (savings / income) * 100;
                    
                    // Format key as "MM-YYYY"
                    String key = String.format("%02d-%d", month, year);
                    monthlySavingsPercentage.put(key, savingsPercentage);
                    
                    // Add to total for average calculation
                    totalSavingsRate += savingsPercentage;
                    monthsWithData++;
                } catch (Exception e) {
                    // Skip if no data for this month
                }
            }
        }
        
        // Calculate average monthly savings rate
        float averageMonthlySavingsRate = monthsWithData > 0 ? totalSavingsRate / monthsWithData : 0f;
        
        return new SavingsDto(averageMonthlySavingsRate, monthlySavingsPercentage);
    }

    /**
     * Calculate average spending statistics.
     */
    private AverageSpendingDto calculateAverageSpending(UUID userId, List<Expense> allExpenses) {
        // Get current date
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        
        // Calculate average daily spend for the current month
        float totalSpentThisMonth = 0f;
        try {
            totalSpentThisMonth = expenseService.getTotalSpentForAMonthOfAUser(userId, currentMonth, currentYear);
        } catch (Exception e) {
            // Handle exception
        }
        
        // Get days in current month
        int daysInMonth = YearMonth.of(currentYear, currentMonth).lengthOfMonth();
        float averageDailySpend = totalSpentThisMonth / daysInMonth;
        
        // Calculate average weekly spend (last 4 weeks)
        float totalSpentLastFourWeeks = 0f;
        int currentWeek = now.get(java.time.temporal.WeekFields.ISO.weekOfYear());
        
        for (int i = 0; i < 4; i++) {
            int week = currentWeek - i;
            int year = currentYear;
            
            // Handle week wrapping to previous year
            if (week <= 0) {
                week += 52;
                year--;
            }
            
            try {
                totalSpentLastFourWeeks += expenseService.getTotalSpentForAWeekOfAUser(userId, week, year);
            } catch (Exception e) {
                // Skip if no data for this week
            }
        }
        
        float averageWeeklySpend = totalSpentLastFourWeeks / 4;
        
        return new AverageSpendingDto(averageDailySpend, averageWeeklySpend);
    }

    /**
     * Calculate budget streak statistics.
     */
    private BudgetStreakDto calculateBudgetStreak(UUID userId) {
        // Get all expense categories with budgets
        List<ExpenseCategory> categories = userService.getUserExpenseCategories(userId);
        
        // Filter categories with budgets
        List<ExpenseCategory> categoriesWithBudgets = categories.stream()
            .filter(c -> c.getBudget() > 0)
            .collect(Collectors.toList());
        
        if (categoriesWithBudgets.isEmpty()) {
            return new BudgetStreakDto(0, "N/A", "N/A");
        }
        
        // Get current date and go back up to 365 days
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(365);
        
        // Track the current streak and the longest streak
        int currentStreak = 0;
        int longestStreak = 0;
        LocalDate longestStreakStart = null;
        LocalDate longestStreakEnd = null;
        LocalDate currentStreakStart = null;
        
        // Check each day from start to end
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            boolean underBudget = isDayUnderBudget(userId, date, categoriesWithBudgets);
            
            if (underBudget) {
                // If this is the start of a new streak, record the start date
                if (currentStreak == 0) {
                    currentStreakStart = date;
                }
                
                // Increment the current streak
                currentStreak++;
                
                // Check if this is now the longest streak
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    longestStreakStart = currentStreakStart;
                    longestStreakEnd = date;
                }
            } else {
                // Reset the current streak
                currentStreak = 0;
            }
        }
        
        // If no streak found, return default values
        if (longestStreak == 0) {
            return new BudgetStreakDto(0, "N/A", "N/A");
        }
        
        // Format dates as strings
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
        String startDateStr = longestStreakStart.format(formatter);
        String endDateStr = longestStreakEnd.format(formatter);
        
        return new BudgetStreakDto(longestStreak, startDateStr, endDateStr);
    }

    /**
     * Check if a specific day is under budget for all categories.
     */
    private boolean isDayUnderBudget(UUID userId, LocalDate date, List<ExpenseCategory> categoriesWithBudgets) {
        // Get month and year
        int month = date.getMonthValue();
        int year = date.getYear();
        int dayOfMonth = date.getDayOfMonth();
        
        // Get days in month to calculate daily budget
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        
        // Check each category
        for (ExpenseCategory category : categoriesWithBudgets) {
            try {
                // Get total spent for this category this month up to this day
                List<Expense> expenses = expenseService.getExpensesForAMonthOfAUserByCategory(userId, month, year, category.getId());
                
                // Filter expenses up to and including the current day
                float totalSpent = expenses.stream()
                    .filter(e -> e.getDate().toLocalDate().getDayOfMonth() <= dayOfMonth)
                    .map(Expense::getAmount)
                    .reduce(0f, Float::sum);
                
                // Calculate prorated budget for this day
                float dailyBudget = category.getBudget() / daysInMonth;
                float proratedBudget = dailyBudget * dayOfMonth;
                
                // If over budget, return false
                if (totalSpent > proratedBudget) {
                    return false;
                }
            } catch (Exception e) {
                // If there's an error, assume over budget
                return false;
            }
        }
        
        // If all categories are under budget, return true
        return true;
    }
}