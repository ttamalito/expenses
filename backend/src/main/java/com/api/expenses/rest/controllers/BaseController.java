package com.api.expenses.rest.controllers;

import com.api.expenses.rest.models.Currency;
import com.api.expenses.rest.models.Expense;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.Income;
import com.api.expenses.rest.models.IncomeCategory;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.services.CurrencyService;
import com.api.expenses.rest.services.ExpenseCategoryService;
import com.api.expenses.rest.services.ExpenseService;
import com.api.expenses.rest.services.IncomeCategoryService;
import com.api.expenses.rest.services.IncomeService;
import com.api.expenses.rest.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/")
public class BaseController {

    private final UserService userService;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final ExpenseCategoryService expenseCategoryService;
    private final IncomeCategoryService incomeCategoryService;
    private final CurrencyService currencyService;
    private final ObjectMapper objectMapper;

    @Autowired
    public BaseController(
            UserService userService,
            ExpenseService expenseService,
            IncomeService incomeService,
            ExpenseCategoryService expenseCategoryService,
            IncomeCategoryService incomeCategoryService,
            CurrencyService currencyService,
            ObjectMapper objectMapper) {
        this.userService = userService;
        this.expenseService = expenseService;
        this.incomeService = incomeService;
        this.expenseCategoryService = expenseCategoryService;
        this.incomeCategoryService = incomeCategoryService;
        this.currencyService = currencyService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Pong");
    }

    @GetMapping("/ping/not")
    public ResponseEntity<String> pingNot() {
        return ResponseEntity.ok("You do not need to be authenticated to access this endpoint");
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportAllData() {
        try {
            // Fetch all data from services
            List<User> users = userService.getAllUsers();
            List<Expense> expenses = expenseService.getAllExpenses();
            List<Income> incomes = incomeService.getAllIncomes();
            List<ExpenseCategory> expenseCategories = expenseCategoryService.getAllCategories();
            List<IncomeCategory> incomeCategories = incomeCategoryService.getAllCategories();
            List<Currency> currencies = currencyService.getAllCurrencies();

            // Create JSON object with all data
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.set("users", objectMapper.valueToTree(users));
            rootNode.set("expenses", objectMapper.valueToTree(expenses));
            rootNode.set("incomes", objectMapper.valueToTree(incomes));
            rootNode.set("expenseCategories", objectMapper.valueToTree(expenseCategories));
            rootNode.set("incomeCategories", objectMapper.valueToTree(incomeCategories));
            rootNode.set("currencies", objectMapper.valueToTree(currencies));

            String jsonData = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);

            // Set headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "expenses_data_export.json");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(jsonData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error exporting data: " + e.getMessage());
        }
    }
}
