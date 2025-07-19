package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.dtos.BudgetBurndownDto;
import com.api.expenses.rest.models.dtos.GetBudgetDto;
import com.api.expenses.rest.models.dtos.UpdateBudgetDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BudgetRequestsIT {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public BudgetRequestsIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    @DisplayName("Modify the budget")
    public void modifyBudget() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String categoryAsString = new String (Files.readAllBytes(Path.of("src/test/resources/budget/createCategories.json")));

        ResultActions result = mockMvc.perform(put("/category/expense/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());

        String categoryId1 = result.andReturn().getResponse().getContentAsString();
        int categoryId1Int = Integer.parseInt(categoryId1);

        ResultActions result2 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());

        String categoryId2 = result2.andReturn().getResponse().getContentAsString();
        int categoryId2Int = Integer.parseInt(categoryId2);

        List<UpdateBudgetDto> newBudgets = new ArrayList<>();
        newBudgets.add(new UpdateBudgetDto(categoryId1Int, 1f));
        newBudgets.add(new UpdateBudgetDto(categoryId2Int, 100f));

        String json = new ObjectMapper().writeValueAsString(newBudgets);

        ResultActions modifyBudgetFetchResult = mockMvc.perform(post("/budget/modify")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        ).andExpect(status().isNoContent());

        ResultActions budgetFetchResult = mockMvc.perform(get("/budget")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String newBudgetAsString = budgetFetchResult.andReturn().getResponse().getContentAsString();
        ObjectMapper objectMapper = new ObjectMapper();
        GetBudgetDto budgetDto = objectMapper.readValue(newBudgetAsString, GetBudgetDto.class);

        List<ExpenseCategory> categories = budgetDto.budget();
        for (ExpenseCategory expenseCategory : categories) {
            if (expenseCategory.getId() == categoryId1Int) {
                assertEquals(1f, expenseCategory.getBudget());
            } else if (expenseCategory.getId() == categoryId2Int) {
                assertEquals(100f, expenseCategory.getBudget());
            }
        }
        mockMvc.perform(delete("/category/expense/delete/" + categoryId1)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());
        mockMvc.perform(delete("/category/expense/delete/" + categoryId2)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get Budget Burndown Data")
    public void getBudgetBurndownData() throws Exception {
        // Login to get bearer token
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, 
                Optional.of("coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create a test expense category with a budget
        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));
        ResultActions categoryResult = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId = categoryResult.andReturn().getResponse().getContentAsString();

        // Create an expense linked to the category
        String expenseJson = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/validExpenseToAdd.json")));
        // Replace the categoryId in the expense JSON
        expenseJson = expenseJson.replace("\"categoryId\": 0", "\"categoryId\": " + categoryId);

        ResultActions expenseResult = mockMvc.perform(post("/expenses/add")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(expenseJson)
        ).andExpect(status().isOk());
        String expenseId = expenseResult.andReturn().getResponse().getContentAsString();

        // Get the current month and year
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Call the budget burndown endpoint
        ResultActions burndownResult = mockMvc.perform(get("/budget/burndown")
                .header("Authorization", bearerToken)
                .param("month", String.valueOf(currentMonth))
                .param("year", String.valueOf(currentYear))
        ).andExpect(status().isOk())
         .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Parse the response
        String burndownJson = burndownResult.andReturn().getResponse().getContentAsString();
        BudgetBurndownDto burndownData = objectMapper.readValue(burndownJson, BudgetBurndownDto.class);

        // Verify the response
        assertEquals(currentMonth, burndownData.month());
        assertEquals(currentYear, burndownData.year());
        assertNotNull(burndownData.categories());

        // Find our test category in the response
        Optional<BudgetBurndownDto.CategoryBurndownDto> testCategory = burndownData.categories().stream()
                .filter(cat -> cat.categoryId() == Integer.parseInt(categoryId))
                .findFirst();

        assertTrue(testCategory.isPresent(), "Test category should be present in the response");

        BudgetBurndownDto.CategoryBurndownDto category = testCategory.get();
        assertEquals("Category to delete", category.categoryName());
        assertEquals(1500.25f, category.budget());
        assertNotNull(category.dailySpending());
        assertNotNull(category.remainingBudget());

        // Clean up
        mockMvc.perform(delete("/expenses/delete?expenseId=" + expenseId)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get Budget Burndown Data for Category with No Expenses")
    public void getBudgetBurndownDataForCategoryWithNoExpenses() throws Exception {
        // Login to get bearer token
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, 
                Optional.of("coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create a test expense category with a budget
        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));
        ResultActions categoryResult = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId = categoryResult.andReturn().getResponse().getContentAsString();

        // Get the current month and year
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Call the budget burndown endpoint
        ResultActions burndownResult = mockMvc.perform(get("/budget/burndown")
                .header("Authorization", bearerToken)
                .param("month", String.valueOf(currentMonth))
                .param("year", String.valueOf(currentYear))
        ).andExpect(status().isOk())
         .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Parse the response
        String burndownJson = burndownResult.andReturn().getResponse().getContentAsString();
        BudgetBurndownDto burndownData = objectMapper.readValue(burndownJson, BudgetBurndownDto.class);

        // Find our test category in the response
        Optional<BudgetBurndownDto.CategoryBurndownDto> testCategory = burndownData.categories().stream()
                .filter(cat -> cat.categoryId() == Integer.parseInt(categoryId))
                .findFirst();

        assertTrue(testCategory.isPresent(), "Test category should be present in the response");

        BudgetBurndownDto.CategoryBurndownDto category = testCategory.get();
        assertEquals("Category to delete", category.categoryName());
        assertEquals(1500.25f, category.budget());
        assertEquals(0f, category.totalSpent(), "Total spent should be 0 for a category with no expenses");

        // Verify daily spending is all zeros
        for (Float spending : category.dailySpending().values()) {
            assertEquals(0f, spending, "Daily spending should be 0 for all days");
        }

        // Verify remaining budget is equal to the budget for all days
        for (Float remaining : category.remainingBudget().values()) {
            assertEquals(1500.25f, remaining, "Remaining budget should equal the total budget for all days");
        }

        // Clean up
        mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get Budget Burndown Data with Default Parameters")
    public void getBudgetBurndownDataWithDefaultParameters() throws Exception {
        // Login to get bearer token
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, 
                Optional.of("coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Call the budget burndown endpoint without specifying month and year
        ResultActions burndownResult = mockMvc.perform(get("/budget/burndown")
                .header("Authorization", bearerToken)
        ).andExpect(status().isOk())
         .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Parse the response
        String burndownJson = burndownResult.andReturn().getResponse().getContentAsString();
        BudgetBurndownDto burndownData = objectMapper.readValue(burndownJson, BudgetBurndownDto.class);

        // Verify the response has the current month and year
        LocalDate now = LocalDate.now();
        assertEquals(now.getMonthValue(), burndownData.month());
        assertEquals(now.getYear(), burndownData.year());
        assertNotNull(burndownData.categories());
    }

    @Test
    @DisplayName("Get Budget Burndown Data for All Categories Option")
    public void getBudgetBurndownDataForAllCategoriesOption() throws Exception {
        // Login to get bearer token
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, 
                Optional.of("coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create two test expense categories with budgets
        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));

        // Create first category
        ResultActions categoryResult1 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId1 = categoryResult1.andReturn().getResponse().getContentAsString();

        // Create second category
        ResultActions categoryResult2 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId2 = categoryResult2.andReturn().getResponse().getContentAsString();

        // Create an expense linked to the first category
        String expenseJson = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/validExpenseToAdd.json")));
        // Replace the categoryId in the expense JSON
        expenseJson = expenseJson.replace("\"categoryId\": 0", "\"categoryId\": " + categoryId1);

        ResultActions expenseResult = mockMvc.perform(post("/expenses/add")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(expenseJson)
        ).andExpect(status().isOk());
        String expenseId = expenseResult.andReturn().getResponse().getContentAsString();

        // Get the current month and year
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Call the budget burndown endpoint
        ResultActions burndownResult = mockMvc.perform(get("/budget/burndown")
                .header("Authorization", bearerToken)
                .param("month", String.valueOf(currentMonth))
                .param("year", String.valueOf(currentYear))
        ).andExpect(status().isOk())
         .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Parse the response
        String burndownJson = burndownResult.andReturn().getResponse().getContentAsString();
        BudgetBurndownDto burndownData = objectMapper.readValue(burndownJson, BudgetBurndownDto.class);

        // Verify the response
        assertEquals(currentMonth, burndownData.month());
        assertEquals(currentYear, burndownData.year());
        assertNotNull(burndownData.categories());

        // Verify that the "All Categories" option is present and is the first in the list
        assertTrue(burndownData.categories().size() > 0, "Categories list should not be empty");
        BudgetBurndownDto.CategoryBurndownDto allCategories = burndownData.categories().get(0);
        assertEquals(-1, allCategories.categoryId(), "First category should be 'All Categories' with ID -1");
        assertEquals("All Categories", allCategories.categoryName(), "First category should be named 'All Categories'");

        // Find our individual test categories in the response
        Optional<BudgetBurndownDto.CategoryBurndownDto> testCategory1 = burndownData.categories().stream()
                .filter(cat -> cat.categoryId() == Integer.parseInt(categoryId1))
                .findFirst();

        Optional<BudgetBurndownDto.CategoryBurndownDto> testCategory2 = burndownData.categories().stream()
                .filter(cat -> cat.categoryId() == Integer.parseInt(categoryId2))
                .findFirst();

        assertTrue(testCategory1.isPresent(), "First test category should be present in the response");
        assertTrue(testCategory2.isPresent(), "Second test category should be present in the response");

        BudgetBurndownDto.CategoryBurndownDto category1 = testCategory1.get();
        BudgetBurndownDto.CategoryBurndownDto category2 = testCategory2.get();

        // Verify that the "All Categories" data correctly includes our test categories
        // Note: The "All Categories" option aggregates ALL categories in the database for the user,
        // not just the ones we created in this test. So we need to check that it includes at least
        // the sum of our test categories.

        float sumOfTestBudgets = category1.budget() + category2.budget();
        float sumOfTestTotalSpent = category1.totalSpent() + category2.totalSpent();

        // Verify that the "All Categories" budget is at least the sum of our test categories' budgets
        assertTrue(allCategories.budget() >= sumOfTestBudgets, 
                "All Categories budget (" + allCategories.budget() + ") should include at least the sum of our test categories' budgets (" + sumOfTestBudgets + ")");

        // Verify that the "All Categories" totalSpent is at least the sum of our test categories' totalSpent
        assertTrue(allCategories.totalSpent() >= sumOfTestTotalSpent, 
                "All Categories totalSpent (" + allCategories.totalSpent() + ") should include at least the sum of our test categories' totalSpent (" + sumOfTestTotalSpent + ")");

        // Verify daily spending aggregation for a sample day
        int sampleDay = 5; // Choose a day that should have spending from our test expense
        if (category1.dailySpending().containsKey(sampleDay) && category2.dailySpending().containsKey(sampleDay)) {
            float expectedDailySpending = category1.dailySpending().get(sampleDay) + category2.dailySpending().get(sampleDay);
            assertEquals(expectedDailySpending, allCategories.dailySpending().get(sampleDay), 
                    "All Categories daily spending should be the sum of individual category daily spending");
        }

        // Clean up
        mockMvc.perform(delete("/expenses/delete?expenseId=" + expenseId)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId1)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId2)
                .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());
    }
}
