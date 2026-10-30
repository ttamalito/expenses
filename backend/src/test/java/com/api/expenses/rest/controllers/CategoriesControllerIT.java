package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.IncomeCategory;
import com.api.expenses.rest.models.dtos.MigrateCategoryDto;
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CategoriesControllerIT {
    private final MockMvc mockMvc;

    @Autowired
    public CategoriesControllerIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    @DisplayName("Add Expense Category and Delete it")
    public void addExpenseCategoryAndDeleteIt() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String categoryAsString = new String (Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));

        ResultActions result = mockMvc.perform(put("/category/expense/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());

        String categoryId = result.andReturn().getResponse().getContentAsString();

        ResultActions categoryFetchResult = mockMvc.perform(get("/category/expense/get/" + categoryId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String categoryFetchResultString = categoryFetchResult.andReturn().getResponse().getContentAsString();
        ObjectMapper objectMapper = new ObjectMapper();
        ExpenseCategory expenseCategory = objectMapper.readValue(categoryFetchResultString, ExpenseCategory.class);

        assertEquals(1500.25f, expenseCategory.getBudget());
        assertEquals("Test description", expenseCategory.getDescription());
        assertEquals("Category to delete", expenseCategory.getName());
        assertEquals(categoryId, String.valueOf(expenseCategory.getId()));
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", expenseCategory.getUserId().toString());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Attempt to delete a category with linked expenses")
    public void deleteCategoryWithLinkedExpenses() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create a category
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

        ResultActions result = mockMvc.perform(post("/expenses/add")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(expenseJson)
        ).andExpect(status().isOk());

        String expenseId = result.andReturn().getResponse().getContentAsString();

        // Try to delete the category, should fail
        ResultActions deleteResult = mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isBadRequest());

        String errorMessage = deleteResult.andReturn().getResponse().getContentAsString();
        assertEquals("Cannot delete category because it has linked expenses", errorMessage);


        // delete the expense
        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        // delete the category
        mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Add Income Category and Delete it")
    public void addIncomeCategoryAndDeleteIt() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String categoryAsString = new String (Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));

        ResultActions result = mockMvc.perform(put("/category/income/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());

        String categoryId = result.andReturn().getResponse().getContentAsString();

        ResultActions categoryFetchResult = mockMvc.perform(get("/category/income/get/" + categoryId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String categoryFetchResultString = categoryFetchResult.andReturn().getResponse().getContentAsString();
        ObjectMapper objectMapper = new ObjectMapper();
        IncomeCategory incomeCategory = objectMapper.readValue(categoryFetchResultString, IncomeCategory.class);

        assertEquals("Category to delete - Income", incomeCategory.getName());
        assertEquals("Test description income", incomeCategory.getDescription());
        assertEquals(categoryId, String.valueOf(incomeCategory.getId()));
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", incomeCategory.getUserId().toString());

        mockMvc.perform(delete("/category/income/delete/" + categoryId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Attempt to delete an income category with linked incomes")
    public void deleteCategoryWithLinkedIncomes() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create a category
        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));
        ResultActions categoryResult = mockMvc.perform(put("/category/income/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId = categoryResult.andReturn().getResponse().getContentAsString();

        // Create an income linked to the category
        String incomeJson = new String(Files.readAllBytes(Path.of("src/test/resources/incomes/validIncomeToAdd.json")));
        // Replace the categoryId in the income JSON
        incomeJson = incomeJson.replace("\"categoryId\": 1", "\"categoryId\": " + categoryId);

        ResultActions result = mockMvc.perform(post("/incomes/add")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(incomeJson)
        ).andExpect(status().isOk());

        String incomeId = result.andReturn().getResponse().getContentAsString().split(":")[1].replace("\"", "").replace("}", "");

        // Try to delete the category, should fail
        ResultActions deleteResult = mockMvc.perform(delete("/category/income/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isBadRequest());

        String errorMessage = deleteResult.andReturn().getResponse().getContentAsString();
        assertEquals("Cannot delete category because it has linked incomes", errorMessage);

        // delete the income
        mockMvc.perform(delete("/incomes/delete/" + incomeId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());

        // delete the category
        mockMvc.perform(delete("/category/income/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get All Expense Categories")
    public void getAllExpenseCategories() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create 3 categories to ensure there are multiple categories to fetch
        String categoryAsString = new String (Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));

        // Create first category
        ResultActions createResult1 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId1 = createResult1.andReturn().getResponse().getContentAsString();

        // Create second category
        ResultActions createResult2 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId2 = createResult2.andReturn().getResponse().getContentAsString();

        // Create third category
        ResultActions createResult3 = mockMvc.perform(put("/category/expense/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId3 = createResult3.andReturn().getResponse().getContentAsString();

        // Now get all categories
        ResultActions result = mockMvc.perform(get("/category/expense/all")
                .header("Authorization", bearerToken)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String resultString = result.andReturn().getResponse().getContentAsString();
        ObjectMapper objectMapper = new ObjectMapper();
        List<ExpenseCategory> categories = objectMapper.readValue(resultString, new TypeReference<List<ExpenseCategory>>() {});

        // Verify that the list contains at least 3 categories
        assert(categories.size() >= 3);

        // Verify that our created categories are in the list
        boolean foundCategory1 = false;
        boolean foundCategory2 = false;
        boolean foundCategory3 = false;

        for (ExpenseCategory category : categories) {
            String categoryIdStr = String.valueOf(category.getId());
            if (categoryIdStr.equals(categoryId1)) {
                foundCategory1 = true;
            } else if (categoryIdStr.equals(categoryId2)) {
                foundCategory2 = true;
            } else if (categoryIdStr.equals(categoryId3)) {
                foundCategory3 = true;
            }
        }

        assert(foundCategory1 && foundCategory2 && foundCategory3);

        // Clean up - delete all categories we created
        mockMvc.perform(delete("/category/expense/delete/" + categoryId1)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId2)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/expense/delete/" + categoryId3)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get All Income Categories")
    public void getAllIncomeCategories() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create 3 categories to ensure there are multiple categories to fetch
        String categoryAsString = new String (Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));

        // Create first category
        ResultActions createResult1 = mockMvc.perform(put("/category/income/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId1 = createResult1.andReturn().getResponse().getContentAsString();

        // Create second category
        ResultActions createResult2 = mockMvc.perform(put("/category/income/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId2 = createResult2.andReturn().getResponse().getContentAsString();

        // Create third category
        ResultActions createResult3 = mockMvc.perform(put("/category/income/create")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryAsString)
        ).andExpect(status().isOk());
        String categoryId3 = createResult3.andReturn().getResponse().getContentAsString();

        // Now get all categories
        ResultActions result = mockMvc.perform(get("/category/income/all")
                .header("Authorization", bearerToken)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String resultString = result.andReturn().getResponse().getContentAsString();
        ObjectMapper objectMapper = new ObjectMapper();
        List<IncomeCategory> categories = objectMapper.readValue(resultString, new TypeReference<List<IncomeCategory>>() {});

        // Verify that the list contains at least 3 categories
        assert(categories.size() >= 3);

        // Verify that our created categories are in the list
        boolean foundCategory1 = false;
        boolean foundCategory2 = false;
        boolean foundCategory3 = false;

        for (IncomeCategory category : categories) {
            String categoryIdStr = String.valueOf(category.getId());
            if (categoryIdStr.equals(categoryId1)) {
                foundCategory1 = true;
            } else if (categoryIdStr.equals(categoryId2)) {
                foundCategory2 = true;
            } else if (categoryIdStr.equals(categoryId3)) {
                foundCategory3 = true;
            }
        }

        assert(foundCategory1 && foundCategory2 && foundCategory3);

        // Clean up - delete all categories we created
        mockMvc.perform(delete("/category/income/delete/" + categoryId1)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/income/delete/" + categoryId2)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        mockMvc.perform(delete("/category/income/delete/" + categoryId3)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Migrate expenses from one expense category to another")
    public void migrateExpensesBetweenCategories() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
        ObjectMapper objectMapper = new ObjectMapper();

        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));

        String categoryAId = mockMvc.perform(put("/category/expense/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String categoryBId = mockMvc.perform(put("/category/expense/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String expenseJson = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/validExpenseToAdd.json")));
        expenseJson = expenseJson.replace("\"categoryId\": 0", "\"categoryId\": " + categoryAId);

        String expenseId = mockMvc.perform(post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String migrateBody = objectMapper.writeValueAsString(
                new MigrateCategoryDto(Integer.parseInt(categoryAId), Integer.parseInt(categoryBId)));

        mockMvc.perform(post("/category/migrate")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(migrateBody)
        ).andExpect(status().isNoContent());

        // Category A is now empty -> deletable
        mockMvc.perform(delete("/category/expense/delete/" + categoryAId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        // Category B now owns the expense -> delete should be blocked
        ResultActions deleteBResult = mockMvc.perform(delete("/category/expense/delete/" + categoryBId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isBadRequest());
        assertEquals("Cannot delete category because it has linked expenses",
                deleteBResult.andReturn().getResponse().getContentAsString());

        // cleanup
        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
        mockMvc.perform(delete("/category/expense/delete/" + categoryBId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Migrate incomes from one income category to another")
    public void migrateIncomesBetweenCategories() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
        ObjectMapper objectMapper = new ObjectMapper();

        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));

        String categoryAId = mockMvc.perform(put("/category/income/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String categoryBId = mockMvc.perform(put("/category/income/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String incomeJson = new String(Files.readAllBytes(Path.of("src/test/resources/incomes/validIncomeToAdd.json")));
        incomeJson = incomeJson.replace("\"categoryId\": 1", "\"categoryId\": " + categoryAId);

        String incomeResponse = mockMvc.perform(post("/incomes/add")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incomeJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String incomeId = incomeResponse.split(":")[1].replace("\"", "").replace("}", "");

        String migrateBody = objectMapper.writeValueAsString(
                new MigrateCategoryDto(Integer.parseInt(categoryAId), Integer.parseInt(categoryBId)));

        mockMvc.perform(post("/category/migrate")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(migrateBody)
        ).andExpect(status().isNoContent());

        // Category A is now empty -> deletable
        mockMvc.perform(delete("/category/income/delete/" + categoryAId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());

        // Category B now owns the income -> delete should be blocked
        ResultActions deleteBResult = mockMvc.perform(delete("/category/income/delete/" + categoryBId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isBadRequest());
        assertEquals("Cannot delete category because it has linked incomes",
                deleteBResult.andReturn().getResponse().getContentAsString());

        // cleanup
        mockMvc.perform(delete("/incomes/delete/" + incomeId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
        mockMvc.perform(delete("/category/income/delete/" + categoryBId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Attempt to migrate between an expense category and an income category")
    public void migrateCategoriesOfDifferentTypesFails() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
        ObjectMapper objectMapper = new ObjectMapper();

        String expenseCategoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));
        String expenseCategoryId = mockMvc.perform(put("/category/expense/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseCategoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String incomeCategoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));
        String incomeCategoryId = mockMvc.perform(put("/category/income/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incomeCategoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String migrateBody = objectMapper.writeValueAsString(
                new MigrateCategoryDto(Integer.parseInt(expenseCategoryId), Integer.parseInt(incomeCategoryId)));

        ResultActions result = mockMvc.perform(post("/category/migrate")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(migrateBody)
        ).andExpect(status().isBadRequest());

        assertEquals("Both categories must be of the same type (either both expense categories or both income categories)",
                result.andReturn().getResponse().getContentAsString());

        // cleanup
        mockMvc.perform(delete("/category/expense/delete/" + expenseCategoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
        mockMvc.perform(delete("/category/income/delete/" + incomeCategoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Attempt to migrate to a category that does not exist")
    public void migrateToNonExistentCategoryFails() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
        ObjectMapper objectMapper = new ObjectMapper();

        String categoryAsString = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));
        String categoryAId = mockMvc.perform(put("/category/expense/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryAsString))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        int nonExistentCategoryId = Integer.MAX_VALUE;

        String migrateBody = objectMapper.writeValueAsString(
                new MigrateCategoryDto(Integer.parseInt(categoryAId), nonExistentCategoryId));

        ResultActions result = mockMvc.perform(post("/category/migrate")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(migrateBody)
        ).andExpect(status().isBadRequest());

        assertEquals("Category not found in the database for the transaction",
                result.andReturn().getResponse().getContentAsString());

        // cleanup
        mockMvc.perform(delete("/category/expense/delete/" + categoryAId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }
}
