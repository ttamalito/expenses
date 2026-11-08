package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.IncomeCategory;
import com.api.expenses.rest.models.dtos.MigrateCategoryDto;
import com.api.expenses.rest.models.dtos.UpdateExpenseCategoryDto;
import com.api.expenses.rest.models.dtos.UpdateIncomeCategoryDto;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
        assertNotNull(errorMessage);


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
        assertNotNull(errorMessage);

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
        assertNotNull(deleteBResult.andReturn().getResponse().getContentAsString());

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
        assertNotNull(deleteBResult.andReturn().getResponse().getContentAsString());

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

        assertNotNull(result.andReturn().getResponse().getContentAsString());

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
        ).andExpect(status().isNotFound());

        assertNotNull(result.andReturn().getResponse().getContentAsString());

        // cleanup
        mockMvc.perform(delete("/category/expense/delete/" + categoryAId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    private String login() throws Exception {
        return AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
    }

    private String createCategoryFromFile(String bearerToken, String type, String path) throws Exception {
        String json = new String(Files.readAllBytes(Path.of(path)));
        return mockMvc.perform(put("/category/" + type + "/create")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
    }

    private void deleteCategory(String bearerToken, String type, String id) throws Exception {
        mockMvc.perform(delete("/category/" + type + "/delete/" + id)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Update all fields of an expense category")
    public void updateExpenseCategory() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();
        String categoryId = createCategoryFromFile(bearerToken, "expense",
                "src/test/resources/categories/expense/validCategory.json");

        UpdateExpenseCategoryDto dto = new UpdateExpenseCategoryDto(
                Integer.parseInt(categoryId), "Updated description", "Updated name", 250.5f);

        mockMvc.perform(put("/category/expense/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());

        String response = mockMvc.perform(get("/category/expense/get/" + categoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        ExpenseCategory updated = objectMapper.readValue(response, ExpenseCategory.class);

        assertEquals("Updated name", updated.getName());
        assertEquals("Updated description", updated.getDescription());
        assertEquals(250.5f, updated.getBudget());
        assertEquals(categoryId, String.valueOf(updated.getId())); // id unchanged

        deleteCategory(bearerToken, "expense", categoryId);
    }

    @Test
    @DisplayName("Partial update of an expense category keeps the other fields")
    public void updateExpenseCategoryPartially() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();
        String categoryId = createCategoryFromFile(bearerToken, "expense",
                "src/test/resources/categories/expense/validCategory.json");

        // only the budget is sent
        UpdateExpenseCategoryDto dto = new UpdateExpenseCategoryDto(
                Integer.parseInt(categoryId), null, null, 99.99f);

        mockMvc.perform(put("/category/expense/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());

        String response = mockMvc.perform(get("/category/expense/get/" + categoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        ExpenseCategory updated = objectMapper.readValue(response, ExpenseCategory.class);

        assertEquals("Category to delete", updated.getName());
        assertEquals("Test description", updated.getDescription());
        assertEquals(99.99f, updated.getBudget());

        deleteCategory(bearerToken, "expense", categoryId);
    }

    @Test
    @DisplayName("Update an expense category that does not exist")
    public void updateNonExistingExpenseCategory() throws Exception {
        String bearerToken = login();
        UpdateExpenseCategoryDto dto = new UpdateExpenseCategoryDto(
                Integer.MAX_VALUE, "desc", "name", 10f);

        mockMvc.perform(put("/category/expense/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Update an expense category with a blank name or negative budget")
    public void updateExpenseCategoryWithInvalidValues() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();
        String categoryId = createCategoryFromFile(bearerToken, "expense",
                "src/test/resources/categories/expense/validCategory.json");
        int id = Integer.parseInt(categoryId);

        mockMvc.perform(put("/category/expense/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateExpenseCategoryDto(id, "desc", "   ", 10f))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/category/expense/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateExpenseCategoryDto(id, "desc", "name", -5f))))
                .andExpect(status().isBadRequest());

        deleteCategory(bearerToken, "expense", categoryId);
    }

    @Test
    @DisplayName("Update an income category")
    public void updateIncomeCategory() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();
        String categoryId = createCategoryFromFile(bearerToken, "income",
                "src/test/resources/categories/income/validCategory.json");

        UpdateIncomeCategoryDto dto = new UpdateIncomeCategoryDto(
                Integer.parseInt(categoryId), "Updated income description", "Updated income name");

        mockMvc.perform(put("/category/income/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());

        String response = mockMvc.perform(get("/category/income/get/" + categoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        IncomeCategory updated = objectMapper.readValue(response, IncomeCategory.class);

        assertEquals("Updated income name", updated.getName());
        assertEquals("Updated income description", updated.getDescription());
        assertEquals(categoryId, String.valueOf(updated.getId()));

        deleteCategory(bearerToken, "income", categoryId);
    }

    @Test
    @DisplayName("Partial update of an income category keeps the other fields")
    public void updateIncomeCategoryPartially() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();
        String categoryId = createCategoryFromFile(bearerToken, "income",
                "src/test/resources/categories/income/validCategory.json");

        // only the name is sent
        UpdateIncomeCategoryDto dto = new UpdateIncomeCategoryDto(
                Integer.parseInt(categoryId), null, "Only name changed");

        mockMvc.perform(put("/category/income/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());

        String response = mockMvc.perform(get("/category/income/get/" + categoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        IncomeCategory updated = objectMapper.readValue(response, IncomeCategory.class);

        assertEquals("Only name changed", updated.getName());
        assertEquals("Test description income", updated.getDescription());

        deleteCategory(bearerToken, "income", categoryId);
    }

    @Test
    @DisplayName("Update an income category that does not exist or has a blank name")
    public void updateIncomeCategoryInvalid() throws Exception {
        String bearerToken = login();
        ObjectMapper objectMapper = new ObjectMapper();

        mockMvc.perform(put("/category/income/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateIncomeCategoryDto(Integer.MAX_VALUE, "desc", "name"))))
                .andExpect(status().isNotFound());

        String categoryId = createCategoryFromFile(bearerToken, "income",
                "src/test/resources/categories/income/validCategory.json");

        mockMvc.perform(put("/category/income/update")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateIncomeCategoryDto(Integer.parseInt(categoryId), "desc", ""))))
                .andExpect(status().isBadRequest());

        deleteCategory(bearerToken, "income", categoryId);
    }
}
