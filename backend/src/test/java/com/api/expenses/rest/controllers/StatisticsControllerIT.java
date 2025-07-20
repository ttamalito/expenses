package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.dtos.StatisticalSummaryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StatisticsControllerIT {
    private final MockMvc mockMvc;
    private String bearerToken;
    private final List<String> expenseCategoryIds = new ArrayList<>();
    private final List<String> incomeCategoryIds = new ArrayList<>();
    private final List<String> expenseIds = new ArrayList<>();
    private final List<String> incomeIds = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public StatisticsControllerIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @BeforeEach
    public void setUp() throws Exception {
        // Login to get bearer token
        bearerToken = AuthenticationHelper.loginUser(mockMvc, 
                Optional.of("coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create expense categories
        String expenseCategoryJson = new String(Files.readAllBytes(Path.of("src/test/resources/categories/expense/validCategory.json")));

        // Create two expense categories
        for (int i = 0; i < 2; i++) {
            ResultActions categoryResult = mockMvc.perform(put("/category/expense/create")
                    .header("Authorization", bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(expenseCategoryJson)
            ).andExpect(status().isOk());

            String categoryId = categoryResult.andReturn().getResponse().getContentAsString();
            expenseCategoryIds.add(categoryId);
        }

        // Create income categories
        String incomeCategoryJson = new String(Files.readAllBytes(Path.of("src/test/resources/categories/income/validCategory.json")));

        // Create two income categories
        for (int i = 0; i < 2; i++) {
            ResultActions categoryResult = mockMvc.perform(put("/category/income/create")
                    .header("Authorization", bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(incomeCategoryJson)
            ).andExpect(status().isOk());

            String categoryId = categoryResult.andReturn().getResponse().getContentAsString();
            incomeCategoryIds.add(categoryId);
        }

        // Create expenses
        String expenseJson = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/validExpenseToAdd.json")));

        // Create expenses for each category
        for (String categoryId : expenseCategoryIds) {
            // Replace the categoryId in the expense JSON
            String modifiedExpenseJson = expenseJson.replace("\"categoryId\": 0", "\"categoryId\": " + categoryId);

            // Create 3 expenses for this category
            for (int i = 0; i < 3; i++) {
                ResultActions expenseResult = mockMvc.perform(post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(modifiedExpenseJson)
                ).andExpect(status().isOk());

                String expenseId = expenseResult.andReturn().getResponse().getContentAsString();
                expenseIds.add(expenseId);
            }
        }

        // Create incomes
        String incomeJson = new String(Files.readAllBytes(Path.of("src/test/resources/incomes/validIncomeToAdd.json")));

        // Create incomes for each category
        for (String categoryId : incomeCategoryIds) {
            // Replace the categoryId in the income JSON
            String modifiedIncomeJson = incomeJson.replace("\"categoryId\": 1", "\"categoryId\": " + categoryId);

            // Create 2 incomes for this category
            for (int i = 0; i < 2; i++) {
                ResultActions incomeResult = mockMvc.perform(post("/incomes/add")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(modifiedIncomeJson)
                ).andExpect(status().isOk());

                String responseContent = incomeResult.andReturn().getResponse().getContentAsString();
                String incomeId = responseContent.split(":")[1].replace("\"", "").replace("}", "");
                incomeIds.add(incomeId);
            }
        }
    }

    @AfterEach
    public void tearDown() throws Exception {
        // Delete all created resources in reverse order

        // Delete expenses
        for (String expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                    .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // Delete incomes
        for (String incomeId : incomeIds) {
            mockMvc.perform(delete("/incomes/delete/" + incomeId)
                    .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // Delete expense categories
        for (String categoryId : expenseCategoryIds) {
            mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                    .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // Delete income categories
        for (String categoryId : incomeCategoryIds) {
            mockMvc.perform(delete("/category/income/delete/" + categoryId)
                    .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // Clear the lists
        expenseCategoryIds.clear();
        incomeCategoryIds.clear();
        expenseIds.clear();
        incomeIds.clear();
    }

    @Test
    @DisplayName("Get Statistical Summary")
    public void getStatisticalSummary() throws Exception {
        // Call the endpoint
        ResultActions result = mockMvc.perform(get("/statistics/summary")
                .header("Authorization", bearerToken)
        ).andExpect(status().isOk())
         .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Parse the response
        String resultString = result.andReturn().getResponse().getContentAsString();
        StatisticalSummaryDto summary = objectMapper.readValue(resultString, StatisticalSummaryDto.class);

        // Verify the structure of the response
        assertNotNull(summary);
        assertNotNull(summary.highestSpending());
        assertNotNull(summary.savings());
        assertNotNull(summary.averageSpending());
        assertNotNull(summary.budgetStreak());

        // Verify highest spending data
        assertNotNull(summary.highestSpending().highestSpendingDay());
        assertNotNull(summary.highestSpending().highestSpendingMonth());
        assertNotNull(summary.highestSpending().highestSpendingCategory());

        // Verify savings data
        assertNotNull(summary.savings().monthlySavingsPercentage());

        // Verify average spending data
        assertTrue(summary.averageSpending().averageDailySpend() >= 0);
        assertTrue(summary.averageSpending().averageWeeklySpend() >= 0);

        // Verify budget streak data
        assertNotNull(summary.budgetStreak().streakStartDate());
        assertNotNull(summary.budgetStreak().streakEndDate());
        assertTrue(summary.budgetStreak().longestStreakDays() >= 0);
    }

    @Test
    @DisplayName("Get Statistical Summary - Unauthenticated")
    public void getStatisticalSummaryUnauthenticated() throws Exception {
        // Call the endpoint without authentication
        mockMvc.perform(get("/statistics/summary"))
                .andExpect(status().isForbidden());
    }
}
