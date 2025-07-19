package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.dtos.BudgetBurndownDto;
import com.api.expenses.rest.models.dtos.UpdateBudgetDto;
import com.api.expenses.rest.services.BudgetService;
import com.api.expenses.rest.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/budget", produces = MediaType.APPLICATION_JSON_VALUE)
public class BudgetController {

    private final UserService userService;
    private final BudgetService budgetService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public BudgetController(UserService userService,
                            BudgetService budgetService) {
        this.userService = userService;
        this.budgetService = budgetService;
    }

    @GetMapping()
    public ResponseEntity<String> getBudget() {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            String categoriesAsJson = budgetService.getBudgetForUserAsJsonString(userId);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(categoriesAsJson);
        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }

    }


    /**
     * route to create or modify the existing budget - It modifies multiple expense categories
     * @param budgets - A Serialized array of budgets, each having a category id and a new budget
     * @return
     */
    @PostMapping("/modify")
    public ResponseEntity<String> modifySetUp(@RequestBody List<UpdateBudgetDto> budgets) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        try {
//            List<ExpenseCategory> categoriesSentFromClient = objectMapper.readValue(listOfCategoriesIds,
//                    objectMapper.getTypeFactory().constructCollectionType(List.class, ExpenseCategory.class));

            List<ExpenseCategory> categoriesFromDb = userService.getUserExpenseCategories(userId);
            for (UpdateBudgetDto budget : budgets) {
                for (ExpenseCategory dbCategory : categoriesFromDb) {
                    if (budget.categoryId() == dbCategory.getId()) {
                        dbCategory.setBudget(budget.newBudget());
                    }
                }
            }
            userService.saveExpenseCategories(categoriesFromDb);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }
    }

    /**
     * Get budget burn-down data for the current month or a specified month and year.
     * This data shows how the budget is being used throughout the month.
     *
     * @param month the month (1-12), defaults to current month if not provided
     * @param year the year, defaults to current year if not provided
     * @return budget burn-down data for each category with a budget
     */
    @GetMapping("/burndown")
    public ResponseEntity<BudgetBurndownDto> getBudgetBurndown(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            // If month or year not provided, use current month/year
            LocalDate now = LocalDate.now();
            int monthValue = month != null ? month : now.getMonthValue();
            int yearValue = year != null ? year : now.getYear();

            BudgetBurndownDto burndownData = budgetService.getBudgetBurndown(userId, monthValue, yearValue);
            return ResponseEntity.ok(burndownData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
