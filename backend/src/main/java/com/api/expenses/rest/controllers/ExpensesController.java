package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.api.expenses.rest.models.Expense;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.models.dtos.CategoryComparisonResponseDto;
import com.api.expenses.rest.models.dtos.CreateExpenseDto;
import com.api.expenses.rest.models.dtos.GetTotalSpentDto;
import com.api.expenses.rest.services.ExpenseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/expenses", produces = {MediaType.APPLICATION_JSON_VALUE})
public class ExpensesController {

    private final ExpenseService expenseService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ExpensesController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addExpense(@RequestBody CreateExpenseDto expense)
            throws TransactionException { // Tested
        User user = null;
        user = ControllersHelper.getUserFromSecurityContextHolder()
                .orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND));

        int expenseID = expenseService.saveExpense(expense, user.getId());
        return ResponseEntity.ok().body(String.valueOf(expenseID));

    }

    @GetMapping("/get/{id}")
    public ResponseEntity<String> getExpenseById(@PathVariable int id)
            throws JsonProcessingException, TransactionException {
        Expense expense = expenseService.getExpenseById(id)
                .orElseThrow(() -> new TransactionException(TransactionException.TransactionExceptionType.EXPENSE_NOT_FOUND));
        String expenseJson = objectMapper.writeValueAsString(expense);
        return ResponseEntity.ok().body(expenseJson);
    }

    @GetMapping("/monthly/{month}/{year}")
    public ResponseEntity<String> getExpensesForAMonth(@PathVariable int month, @PathVariable int year)
            throws UserException, JsonProcessingException { // Tested
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<Expense> expenses = expenseService.getExpensesForAMonthOfAUser(user.getId(), (month), (year));
        String expensesJson = objectMapper.writeValueAsString(expenses);
        return ResponseEntity.ok().body(expensesJson);

    }

    @GetMapping("/single-type/{month}/{year}") // Tested
    public ResponseEntity<String> getExpensesOfATypeForAMonth(@PathVariable int month, @PathVariable int year,
                                                              @RequestParam int categoryId)
            throws TransactionException, JsonProcessingException {
        UUID userId = getUserId();

        List<Expense> expenses = expenseService.getExpensesForAMonthOfAUserByCategory(userId, month, year, categoryId);
        String expensesJson = objectMapper.writeValueAsString(expenses);
        return ResponseEntity.ok().body(expensesJson);
    }

    @GetMapping("/{month}/{year}/tag/{tagId}")
    public ResponseEntity<List<Expense>> getExpensesOfATagForAMonth(@PathVariable int month, @PathVariable int year,
                                                                    @PathVariable int tagId) {
        UUID userId = getUserId();

        try {
            List<Expense> expenses = expenseService.getExpensesForAMonthOfAUserByTag(userId, month, year, tagId);
            return ResponseEntity.ok(expenses);
        } catch (TransactionException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/total-spent/{month}/{year}/tag/{tagId}") // Tested
    public ResponseEntity<GetTotalSpentDto> getTotalSpentOnAMonthForATag(@PathVariable int month,
                                                                         @PathVariable int year,
                                                                         @PathVariable int tagId)
            throws TransactionException {
        UUID userId = getUserId();
        float totalSpent = expenseService.getTotalSpentForAMonthOfAUserByTag(userId, month, year, tagId);
        GetTotalSpentDto totalSpentDto = new GetTotalSpentDto(totalSpent);
        return ResponseEntity.ok(totalSpentDto);
    }

    @GetMapping("/yearly/{year}") // Tested
    public ResponseEntity<String> getExpensesForAYear(@PathVariable int year)
            throws TransactionException, JsonProcessingException {
        UUID userId = getUserId();

        List<Expense> expenses = expenseService.getExpensesForAYearOfAUser(userId, (year));
        String expensesJson = objectMapper.writeValueAsString(expenses);
        return ResponseEntity.ok().body(expensesJson);
    }

    @GetMapping("/single-type") // Tested
    public ResponseEntity<String> getExpensesForAYearOfAType(@RequestParam int year, @RequestParam int categoryId)
            throws JsonProcessingException, TransactionException {
        UUID userId = getUserId();

        List<Expense> expenses = expenseService.getExpensesForAYearOfAUserByCategory(userId, year, categoryId);
        String expensesJson = objectMapper.writeValueAsString(expenses);
        return ResponseEntity.ok().body(expensesJson);
    }

    @GetMapping("/total-spent") // Tested
    public ResponseEntity<String> getTotalSpentOnAYear(@RequestParam int year) throws TransactionException {
        // Get total spent on a year
        UUID userId = getUserId();

        float totalSpent = expenseService.getTotalSpentForAYearOfAUser(userId, year);
        String totalSpentJson = "{\"totalSpent\":" + totalSpent + "}";
        return ResponseEntity.ok().body(totalSpentJson);
    }

    @PostMapping("/modify")
    public ResponseEntity<String> modifySingleExpense(@RequestBody Expense expense) throws TransactionException {
        UUID userId = getUserId();
        expenseService.updateExpense(expense);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total-spent/monthly") // Tested
    public ResponseEntity<String> getTotalSpentOnAMonth(@RequestParam int month, @RequestParam int year)
            throws TransactionException {
        // in the js implementation we used a query param type=all to denote that we want to get all the expenses
        // this is done now by getTotalSpentOnAMonthForACategory
        UUID userId = getUserId();

        float totalSpent = expenseService.getTotalSpentForAMonthOfAUser(userId, month, year);
        String totalSpentJson = "{\"totalSpent\":" + totalSpent + "}";
        return ResponseEntity.ok().body(totalSpentJson);
    }

    @GetMapping("/total-spent/monthly/category") // Tested
    public ResponseEntity<String> getTotalSpentOnAMonthForACategory(@RequestParam int month,
                                                                    @RequestParam int year,
                                                                    @RequestParam int category)
            throws TransactionException {
        UUID userId = getUserId();
        float totalSpent = expenseService.getTotalSpentForAMonthOfAUserByCategory(userId, month, year, category);
        String totalSpentJson = "{\"totalSpent\":" + totalSpent + "}";
        return ResponseEntity.ok().body(totalSpentJson);
    }

    @DeleteMapping("/delete") // Tested
    public ResponseEntity<String> deleteExpense(@RequestParam int expenseId) throws TransactionException {
        UUID userId = getUserId();
        Expense expense = expenseService.getExpenseById(expenseId).get();
        if (!expense.getUser().getId().equals(userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.UNAUTHORIZED);
        }
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.noContent().build();
    }

    // options this could be deleted, as spring boot handles this automatically
    @RequestMapping(value = "/delete", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> deleteExpenseOptions() {
        return ResponseEntity
                .ok()
                .allow(HttpMethod.GET, HttpMethod.DELETE, HttpMethod.PUT, HttpMethod.OPTIONS)
                .build();
    }

    private UUID getUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }

    /**
     * Compare spending across categories between different time periods.
     *
     * @param currentPeriodType   The type of the current period ("month" or "year")
     * @param currentPeriodValue  The value of the current period (month number or year)
     * @param previousPeriodType  The type of the previous period ("month" or "year")
     * @param previousPeriodValue The value of the previous period (month number or year)
     * @param currentYear         The year of the current period (required if currentPeriodType is "month")
     * @param previousYear        The year of the previous period (required if previousPeriodType is "month")
     * @return A JSON response containing the comparison data
     */
    @GetMapping("/compare")
    public ResponseEntity<CategoryComparisonResponseDto> compareCategories(
            @RequestParam String currentPeriodType,
            @RequestParam int currentPeriodValue,
            @RequestParam String previousPeriodType,
            @RequestParam int previousPeriodValue,
            @RequestParam(required = false) Integer currentYear,
            @RequestParam(required = false) Integer previousYear) throws TransactionException {

        UUID userId = getUserId();

        CategoryComparisonResponseDto comparisonData = expenseService.compareCategoriesBetweenPeriods(
                userId,
                currentPeriodType,
                currentPeriodValue,
                previousPeriodType,
                previousPeriodValue,
                currentYear,
                previousYear
        );
        return ResponseEntity.ok(comparisonData);
    }
}
