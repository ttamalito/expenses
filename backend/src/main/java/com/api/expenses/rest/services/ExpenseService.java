package com.api.expenses.rest.services;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.api.expenses.rest.models.*;
import com.api.expenses.rest.models.dtos.CategoryComparisonDto;
import com.api.expenses.rest.models.dtos.CategoryComparisonResponseDto;
import com.api.expenses.rest.models.dtos.CreateExpenseDto;
import com.api.expenses.rest.repositories.CurrencyRepository;
import com.api.expenses.rest.repositories.ExpenseCategoryRepository;
import com.api.expenses.rest.repositories.ExpenseRepository;
import com.api.expenses.rest.repositories.TagRepository;
import com.api.expenses.rest.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;

import java.sql.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    private final ExpenseCategoryRepository expenseCategoryRepository;

    private final CurrencyRepository currencyRepository;
    private final TagRepository tagRepository;

    private final UserService userService;
    private final ExpenseCategoryService expenseCategoryService;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository,
                          @Lazy ExpenseCategoryRepository expenseCategoryRepository,
                          @Lazy CurrencyRepository currencyRepository,
                          @Lazy UserService userService,
                          ExpenseCategoryService expenseCategoryService,
                          TagRepository tagRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.currencyRepository = currencyRepository;
        this.userService = userService;
        this.expenseCategoryService = expenseCategoryService;
        this.tagRepository = tagRepository;
    }

    public List<Expense> getExpensesForAMonthOfAUser(UUID userId, int month, int year) throws UserException {
        userService.getUserById(userId).orElseThrow(() -> new UserException(UserException.UserExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);

    }

    /**
     * Saves an expense
     *
     * @param expenseFromRequest
     * @param userId
     * @return the id of the saved expense
     * @throws TransactionException
     */
    public int saveExpense(CreateExpenseDto expenseFromRequest, UUID userId) throws TransactionException {
        User user = userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        ExpenseCategory expenseCategory = expenseCategoryRepository.findById(expenseFromRequest.categoryId()).orElseThrow(() ->
                new TransactionException(TransactionException.TransactionExceptionType.CATEGORY_NOT_FOUND));


        Currency currency = currencyRepository.findById(expenseFromRequest.currencyId()).orElseThrow(() ->
                new TransactionException(TransactionException.TransactionExceptionType.CURRENCY_NOT_FOUND));

        Tag tag = null; // TODO: Check if the user owns the TAG
        if (expenseFromRequest.tagId() != null && expenseFromRequest.tagId().isPresent()) {
            tag = tagRepository.findById(expenseFromRequest.tagId().get()).orElseThrow( () ->
                    new TransactionException(TransactionException.TransactionExceptionType.TAG_NOT_FOUND));
        }


        Date date = expenseFromRequest.date();

        final int week = DateUtils.getWeekOfTheYear(date);
        final int month = DateUtils.getMonthOfTheYear(date);
        final int year = DateUtils.getYearOfTheDate(date);

        if (expenseFromRequest.amount() < 0) {
            throw new TransactionException(TransactionException.TransactionExceptionType.NEGATIVE_AMOUNT);
        }


        Expense expense = new Expense(
                user,
                expenseCategory,
                expenseFromRequest.amount(),
                date,
                expenseFromRequest.description(),
                month,
                year,
                week,
                currency,
                tag
        );
        return expenseRepository.save(expense).getId();
    }

    public List<Expense> getExpensesForAYearOfAUser(UUID userId, int year) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserIdAndYear(userId, year);
    }

    public List<Expense> getExpensesForAMonthOfAUserByCategory(UUID userId, int month, int year, int categoryId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserIdAndMonthAndYearAndCategoryId(userId, month, year, categoryId);
    }

    public List<Expense> getExpensesForAWeekOfAUser(UUID userId, int week, int year) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserIdAndWeekAndYear(userId, week, year);
    }

    public List<Expense> getAllExpensesOfAUser(UUID userId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserId(userId);
    }

    public List<Expense> getExpensesForAYearOfAUserByCategory(UUID userId, int year, int categoryId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        return expenseRepository.findByUserIdAndYearAndCategoryId(userId, year, categoryId);
    }

    public float getTotalSpentForAMonthOfAUser(UUID userId, int month, int year) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public float getTotalSpentForAYearOfAUser(UUID userId, int year) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndYear(userId, year);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public float getTotalSpentForAWeekOfAUser(UUID userId, int week, int year) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndWeekAndYear(userId, week, year);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public float getTotalSpentForAYearOfAUserByCategory(UUID userId, int year, int categoryId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndYearAndCategoryId(userId, year, categoryId);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public float getTotalSpentForAMonthOfAUserByCategory(UUID userId, int month, int year, int categoryId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYearAndCategoryId(userId, month, year, categoryId);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public float getTotalSpentForAWeekOfAUserByCategory(UUID userId, int week, int year, int categoryId) throws TransactionException {
        userService.getUserById(userId).orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        List<Expense> expenses = expenseRepository.findByUserIdAndWeekAndYearAndCategoryId(userId, week, year, categoryId);
        float totalSpent = 0;
        for (Expense expense : expenses) {
            totalSpent += expense.getAmount();
        }
        return totalSpent;
    }

    public void deleteExpense(int expenseId) {
        expenseRepository.deleteById(expenseId);
    }

    public void updateExpense(Expense expense) throws TransactionException {
        ExpenseCategory expenseCategory = expenseCategoryService.
                getCategoryById(expense.getCategoryId()).
                orElseThrow(
                        () -> new TransactionException(TransactionException.TransactionExceptionType.CATEGORY_NOT_FOUND)
                );

        expense.setCategory(expenseCategory);

        User user = userService.getUserById(expense.getUserId()).orElseThrow(
                () -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND)
        );
        expense.setUser(user);

        Currency currency = currencyRepository.findById(expense.getCurrencyId()).orElseThrow(() ->
                new TransactionException(TransactionException.TransactionExceptionType.CURRENCY_NOT_FOUND));

        expense.setCurrency(currency);

        Date date = expense.getDate();
        final int week = DateUtils.getWeekOfTheYear(date);
        final int month = DateUtils.getMonthOfTheYear(date);
        final int year = DateUtils.getYearOfTheDate(date);
        expense.setWeek(week);
        expense.setMonth(month);
        expense.setYear(year);

        expenseRepository.save(expense);
    }

    public boolean expenseExists(int expenseId) {
        return expenseRepository.existsById(expenseId);
    }

    public Optional<Expense> getExpenseById(int expenseId) {
        return expenseRepository.findById(expenseId);
    }

    public boolean hasExpensesLinkedToCategory(int categoryId) {
        return expenseRepository.countByCategoryId(categoryId) > 0;
    }

    /**
     * Gets all expenses from the database
     * @return a list of all expenses
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    /**
     * Compares spending across categories between two time periods.
     * 
     * @param userId The ID of the user
     * @param currentPeriodType The type of the current period ("month" or "year")
     * @param currentPeriodValue The value of the current period (month number or year)
     * @param previousPeriodType The type of the previous period ("month" or "year")
     * @param previousPeriodValue The value of the previous period (month number or year)
     * @param currentYear The year of the current period (required if currentPeriodType is "month")
     * @param previousYear The year of the previous period (required if previousPeriodType is "month")
     * @return A DTO containing the comparison data
     * @throws TransactionException If the user is not found
     */
    public CategoryComparisonResponseDto compareCategoriesBetweenPeriods(
            UUID userId,
            String currentPeriodType,
            int currentPeriodValue,
            String previousPeriodType,
            int previousPeriodValue,
            Integer currentYear,
            Integer previousYear) throws TransactionException {

        // Validate user
        userService.getUserById(userId).orElseThrow(() -> 
            new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        // Get all categories for the user
        List<ExpenseCategory> categories = expenseCategoryRepository.findByUserId(userId);

        // Prepare result containers
        List<CategoryComparisonDto> categoryComparisons = new ArrayList<>();
        float totalCurrentPeriod = 0;
        float totalPreviousPeriod = 0;

        // Generate period labels
        String currentPeriodLabel = generatePeriodLabel(currentPeriodType, currentPeriodValue, currentYear);
        String previousPeriodLabel = generatePeriodLabel(previousPeriodType, previousPeriodValue, previousYear);

        // For each category, get expenses for both periods and calculate comparison data
        for (ExpenseCategory category : categories) {
            List<Expense> currentPeriodExpenses;
            List<Expense> previousPeriodExpenses;

            // Get expenses for current period
            if ("month".equals(currentPeriodType)) {
                if (currentYear == null) {
                    throw new IllegalArgumentException("Current year is required when period type is month");
                }
                currentPeriodExpenses = expenseRepository.findByUserIdAndMonthAndYearAndCategoryId(
                        userId, currentPeriodValue, currentYear, category.getId());
            } else if ("year".equals(currentPeriodType)) {
                currentPeriodExpenses = expenseRepository.findByUserIdAndYearAndCategoryId(
                        userId, currentPeriodValue, category.getId());
            } else {
                throw new IllegalArgumentException("Invalid current period type: " + currentPeriodType);
            }

            // Get expenses for previous period
            if ("month".equals(previousPeriodType)) {
                if (previousYear == null) {
                    throw new IllegalArgumentException("Previous year is required when period type is month");
                }
                previousPeriodExpenses = expenseRepository.findByUserIdAndMonthAndYearAndCategoryId(
                        userId, previousPeriodValue, previousYear, category.getId());
            } else if ("year".equals(previousPeriodType)) {
                previousPeriodExpenses = expenseRepository.findByUserIdAndYearAndCategoryId(
                        userId, previousPeriodValue, category.getId());
            } else {
                throw new IllegalArgumentException("Invalid previous period type: " + previousPeriodType);
            }

            // Calculate totals for this category
            float currentPeriodTotal = calculateTotal(currentPeriodExpenses);
            float previousPeriodTotal = calculateTotal(previousPeriodExpenses);

            // Skip categories with no expenses in either period
            if (currentPeriodTotal == 0 && previousPeriodTotal == 0) {
                continue;
            }

            // Calculate difference and percentage change
            float difference = currentPeriodTotal - previousPeriodTotal;
            float percentageChange = previousPeriodTotal == 0 ? 
                    (currentPeriodTotal > 0 ? 100 : 0) : 
                    (difference / previousPeriodTotal) * 100;

            // Create DTO for this category
            CategoryComparisonDto comparisonDto = new CategoryComparisonDto(
                    category.getId(),
                    category.getName(),
                    currentPeriodTotal,
                    previousPeriodTotal,
                    difference,
                    percentageChange
            );

            categoryComparisons.add(comparisonDto);

            // Add to totals
            totalCurrentPeriod += currentPeriodTotal;
            totalPreviousPeriod += previousPeriodTotal;
        }

        // Calculate total difference and percentage change
        float totalDifference = totalCurrentPeriod - totalPreviousPeriod;
        float totalPercentageChange = totalPreviousPeriod == 0 ? 
                (totalCurrentPeriod > 0 ? 100 : 0) : 
                (totalDifference / totalPreviousPeriod) * 100;

        // Create and return response DTO
        return new CategoryComparisonResponseDto(
                currentPeriodLabel,
                previousPeriodLabel,
                categoryComparisons,
                totalCurrentPeriod,
                totalPreviousPeriod,
                totalDifference,
                totalPercentageChange
        );
    }

    /**
     * Generates a human-readable label for a period.
     */
    private String generatePeriodLabel(String periodType, int periodValue, Integer year) {
        if ("month".equals(periodType)) {
            Month month = Month.of(periodValue);
            return month.getDisplayName(TextStyle.FULL, java.util.Locale.getDefault()) + " " + year;
        } else if ("year".equals(periodType)) {
            return String.valueOf(periodValue);
        } else {
            return periodType + " " + periodValue;
        }
    }

    /**
     * Calculates the total amount for a list of expenses.
     */
    private float calculateTotal(List<Expense> expenses) {
        float total = 0;
        for (Expense expense : expenses) {
            total += expense.getAmount();
        }
        return total;
    }
}
