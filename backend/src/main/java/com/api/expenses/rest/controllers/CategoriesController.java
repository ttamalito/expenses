package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.IncomeCategory;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.models.dtos.CreateExpenseCategoryDto;
import com.api.expenses.rest.models.dtos.CreateIncomeCategoryDto;
import com.api.expenses.rest.models.dtos.GetExpenseCategoryDto;
import com.api.expenses.rest.models.dtos.GetIncomeCategoryDto;
import com.api.expenses.rest.services.ExpenseCategoryService;
import com.api.expenses.rest.services.IncomeCategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(value = "/category", produces = {MediaType.APPLICATION_JSON_VALUE})
public class CategoriesController {

    private final ExpenseCategoryService expenseCategoryService;
    private final IncomeCategoryService incomeCategoryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public CategoriesController(ExpenseCategoryService expenseCategoryService,
                                IncomeCategoryService incomeCategoryService) {
        this.expenseCategoryService = expenseCategoryService;
        this.incomeCategoryService = incomeCategoryService;
    }

    @GetMapping("/expense/get/{categoryId}")
    public ResponseEntity<GetExpenseCategoryDto> getExpenseCategory(@PathVariable int categoryId) {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Optional<ExpenseCategory> category = expenseCategoryService.getCategoryById(categoryId);
            if (category.isPresent()) {
                ExpenseCategory expenseCategory = category.get();
                GetExpenseCategoryDto dto = new GetExpenseCategoryDto(
                        expenseCategory.getId(),
                        expenseCategory.getUserId(),
                        expenseCategory.getName(),
                        expenseCategory.getDescription(),
                        expenseCategory.getBudget()
                );
                return ResponseEntity.ok(dto);
            }
        }

        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/expense/create")
    public ResponseEntity<String> saveExpenseCategory(@RequestBody CreateExpenseCategoryDto expenseCategory) {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            ExpenseCategory category = new ExpenseCategory(
                    user, expenseCategory.name(),
                    expenseCategory.budget(),
                    expenseCategory.description()
            );
            int categoryID = expenseCategoryService.createCategory(category);
            return ResponseEntity.ok(String.valueOf(categoryID));
        }
        return ResponseEntity.badRequest().body("No user found with the token");
    }

    @DeleteMapping("/expense/delete/{categoryId}")
    public ResponseEntity<String> saveExpenseCategory(@PathVariable int categoryId) throws TransactionException {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            expenseCategoryService.deleteCategory(categoryId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.badRequest().body("No user found with the token");
    }

    @GetMapping("/income/get/{categoryId}")
    public ResponseEntity<GetIncomeCategoryDto> getIncomeCategory(@PathVariable int categoryId) {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Optional<IncomeCategory> category = incomeCategoryService.getCategoryById(categoryId);
            if (category.isPresent()) {
                IncomeCategory incomeCategory = category.get();
                GetIncomeCategoryDto dto = new GetIncomeCategoryDto(
                        incomeCategory.getId(),
                        incomeCategory.getUserId(),
                        incomeCategory.getName(),
                        incomeCategory.getDescription()
                );
                return ResponseEntity.ok(dto);
            }
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/income/create")
    public ResponseEntity<String> saveIncomeCategory(@RequestBody CreateIncomeCategoryDto incomeCategory) {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            IncomeCategory category = new IncomeCategory(
                    user, incomeCategory.name(),
                    incomeCategory.description()
            );
            int categoryID = incomeCategoryService.createCategory(category);
            return ResponseEntity.ok(String.valueOf(categoryID));
        }
        return ResponseEntity.badRequest().body("No user found with the token");
    }

    @DeleteMapping("/income/delete/{categoryId}")
    public ResponseEntity<String> saveIncomeCategory(@PathVariable int categoryId) throws TransactionException {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            incomeCategoryService.deleteCategory(categoryId);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.badRequest().body("No user found with the token");
    }

    @GetMapping("/expense/all")
    public ResponseEntity<List<GetExpenseCategoryDto>> getAllExpenseCategories() {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<ExpenseCategory> categories = expenseCategoryService.getCategoriesForUser(user.getId());
            List<GetExpenseCategoryDto> dtos = categories.stream()
                    .map(category -> new GetExpenseCategoryDto(
                            category.getId(),
                            category.getUserId(),
                            category.getName(),
                            category.getDescription(),
                            category.getBudget()
                    ))
                    .toList();
            return ResponseEntity.ok(dtos);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/income/all")
    public ResponseEntity<List<GetIncomeCategoryDto>> getAllIncomeCategories() {
        Optional<User> optionalUser = ControllersHelper.getUserFromSecurityContextHolder();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<IncomeCategory> categories = incomeCategoryService.getCategoriesForUser(user.getId());
            List<GetIncomeCategoryDto> dtos = categories.stream()
                    .map(category -> new GetIncomeCategoryDto(
                            category.getId(),
                            category.getUserId(),
                            category.getName(),
                            category.getDescription()
                    ))
                    .toList();
            return ResponseEntity.ok(dtos);
        }

        return ResponseEntity.badRequest().build();
    }
}
