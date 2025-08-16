package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.Expense;
import com.api.expenses.rest.models.dtos.CreateExpenseCategoryDto;
import com.api.expenses.rest.models.dtos.CreateExpenseDto;
import com.api.expenses.rest.models.dtos.GetTagDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.util.Pair;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ExpensesRequestsIT {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ExpensesRequestsIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @BeforeEach
    public void setUp() throws IOException {
        objectMapper.registerModule(new Jdk8Module());
    }

    @Test
    public void addAndDeleteValidExpense() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addCategoryIdToExpense(categoryId, "src/test/resources/expenses/validExpenseToAdd.json");

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());
        String expenseId = result.andReturn().getResponse().getContentAsString();

        ResultActions expenseResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/get/" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expenseJson = expenseResult.andReturn().getResponse().getContentAsString();
        Expense expense = objectMapper.readValue(expenseJson, Expense.class);
        assertEquals(100f, expense.getAmount());
        assertEquals(expenseId, String.valueOf(expense.getId()));
        assertEquals("Test expense description", expense.getDescription());
        assertEquals(categoryId, expense.getCategoryId());
        assertEquals(1, expense.getCurrencyId());
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", expense.getUserId().toString());
        assertEquals(1, expense.getMonth());
        assertEquals(2025, expense.getYear());
        assertTrue(expense.getWeek() > 0);
        assertEquals("2025-01-05", expense.getDate().toString());

        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
    }

    @DisplayName("Expenses for a single month")
    @Test
    public void getExpensesForAMonth() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories
        List<Integer> categoriesIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/singleMonth/categoriesForAMonth.json");

        // add the categories ids to the expenses
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1 = Pair.of(0, categoriesIds.get(0));
        categoryIdsPairs.add(pair1);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2 = Pair.of(1, categoriesIds.get(1));
        categoryIdsPairs.add(pair2);
        // Expense 3 - Category 3
        Pair<Integer, Integer> pair3 = Pair.of(2, categoriesIds.get(2));
        categoryIdsPairs.add(pair3);
        // Expense 4 - Category 1
        Pair<Integer, Integer> pair4 = Pair.of(3, categoriesIds.get(0));
        categoryIdsPairs.add(pair4);
        // Expense 5 - Category 2
        Pair<Integer, Integer> pair5 = Pair.of(4, categoriesIds.get(1));
        categoryIdsPairs.add(pair5);

        String expensesToAddAsJson = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs, "src/test/resources/expenses/singleMonth/expensesForAMonth.json");
        
        List<CreateExpenseDto> expenses = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken, expensesToAddAsJson, expenses);
        // TODO: add a request with an expense that is not in the month and year
        // this needs to be done in a different json file.

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesJson = savedExpense.andReturn().getResponse().getContentAsString();
        List<Expense> expensesFromServer = objectMapper.readValue(expensesJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));

        assertEquals(expenses.size(), expensesFromServer.size());
        // compare the expeses that were sent to the server with the ones that were received
        for (int i = 0; i < expenses.size(); i++) {
            int expenseId = expenseIds.get(i);
            CreateExpenseDto sentExpense = expenses.get(i);
            Optional<Expense> receivedExpenseOptional = expensesFromServer.stream().filter(expense -> expense.getId() == expenseId).findAny();
            assertTrue(receivedExpenseOptional.isPresent());
            Expense receivedExpense = receivedExpenseOptional.get();
            assertEquals(sentExpense.amount(), receivedExpense.getAmount());
            assertEquals(sentExpense.categoryId(), receivedExpense.getCategoryId());
            assertEquals(sentExpense.date().toString(), receivedExpense.getDate().toString());
            assertEquals(sentExpense.description(), receivedExpense.getDescription());
            //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", receivedExpense.getUserId().toString());
            assertTrue(1 == receivedExpense.getMonth());
            assertTrue(2025 == receivedExpense.getYear());
            assertTrue(receivedExpense.getWeek() > 0);
        }

        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        for (int categoryId : categoriesIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }

    @DisplayName("Expenses for a single month and a single category")
    @Test
    public void getExpensesForAMonthAndACategory() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                    "coding.tamalito@gmail.com"),
            Optional.empty(),
            "123456"
    );

        // create the three categories for the expenses that will not be queried
        List<Integer> undesirableCategoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/singleMonthAndCategory/multipleCategories.json");

        // add the undesirable categories ids to the expenses that should not be qureid
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1 = Pair.of(0, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair1);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2 = Pair.of(1, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair2);
        // Expense 3 - Category 1
        Pair<Integer, Integer> pair3 = Pair.of(2, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair3);
        // Expense 4 - Category 2
        Pair<Integer, Integer> pair4 = Pair.of(3, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair4);
        // Expense 5 - Category 2
        Pair<Integer, Integer> pair5 = Pair.of(4, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair5);
        // Expense 6 - Category 3
        Pair<Integer, Integer> pair6 = Pair.of(5, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair6);

        String expenseThatShouldNotBeQueried = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/singleMonthAndCategory/expensesNotToQuery.json");

        
        List<CreateExpenseDto> expensesToSendAndIgnore = new ArrayList<>();
        List<Integer> expenseIdsToIgnore = sendAndSaveExpenses(bearerToken,
                expenseThatShouldNotBeQueried, expensesToSendAndIgnore);

        // category of the expenses that should be queried
        int desirableCategoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/singleMonthAndCategory/singleCategory.json");

        // prepare the expenses that should be queried
        // add the category id to the expenses that should be queried
        List<Pair<Integer, Integer>> desirableIdPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1Desirable = Pair.of(0, desirableCategoryId);
        desirableIdPairs.add(pair1Desirable);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2Desirable = Pair.of(1, desirableCategoryId);
        desirableIdPairs.add(pair2Desirable);

        String expensesThatShouldBeQueried = addCategoryToListOfExpensesInSpecificPosition(desirableIdPairs,
                "src/test/resources/expenses/singleMonthAndCategory/expensesToBeQueried.json");

        // add expenses that should be queried
        List<CreateExpenseDto> expensesToBeQueried = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesThatShouldBeQueried, expensesToBeQueried);


        // query the expenses
        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/single-type/1/2025?categoryId=" + desirableCategoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesJson = savedExpense.andReturn().getResponse().getContentAsString();
        List<Expense> expensesFromServer = objectMapper.readValue(expensesJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));
        assertEquals(expensesToBeQueried.size(), expensesFromServer.size()); // should be 2

        // compare the expeses that were sent to the server with the ones that were received
        for (int i = 0; i < expensesToBeQueried.size(); i++) {
            int expenseId = expenseIds.get(i);
            CreateExpenseDto sentExpense = expensesToBeQueried.get(i);
            Optional<Expense> receivedExpenseOptional = expensesFromServer.stream().filter(expense -> expense.getId() == expenseId).findAny();
            assertTrue(receivedExpenseOptional.isPresent());
            Expense receivedExpense = receivedExpenseOptional.get();
            assertEquals(sentExpense.amount(), receivedExpense.getAmount());
            assertEquals(sentExpense.categoryId(), receivedExpense.getCategoryId());
            assertEquals(sentExpense.currencyId(), receivedExpense.getCurrencyId());
            assertEquals(sentExpense.date().toString(), receivedExpense.getDate().toString());
            assertEquals(sentExpense.description(), receivedExpense.getDescription());
            assertEquals(1, receivedExpense.getMonth());
            assertEquals(2025, receivedExpense.getYear());
        }

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        for (int expenseId : expenseIdsToIgnore) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // delete the categories
        for (int categoryId : undesirableCategoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
        deleteExpenseCategory(bearerToken, desirableCategoryId);

    }

    @DisplayName("Expenses for a single year")
    @Test
    public void getExpensesForAYear() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses that will not be queried
        List<Integer> undesirableCategoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/singleYear/multipleCategories.json");

        // add the undesirable categories ids to the expenses that should not be qureid
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1 = Pair.of(0, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair1);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2 = Pair.of(1, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair2);
        // Expense 3 - Category 1
        Pair<Integer, Integer> pair3 = Pair.of(2, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair3);
        // Expense 4 - Category 2
        Pair<Integer, Integer> pair4 = Pair.of(3, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair4);
        // Expense 5 - Category 2
        Pair<Integer, Integer> pair5 = Pair.of(4, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair5);
        // Expense 6 - Category 3
        Pair<Integer, Integer> pair6 = Pair.of(5, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair6);

        String expenseThatShouldNotBeQueried = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/singleYear/expensesNotToQuery.json");

        
        // add expenses that should not be queried
        List<CreateExpenseDto> expensesToSendAndIgnore = new ArrayList<>();
        List<Integer> expenseIdsToIgnore = sendAndSaveExpenses(bearerToken,
                expenseThatShouldNotBeQueried, expensesToSendAndIgnore);


        // prepare the expenses that should be queried
        // add the categories ids to the expenses that should be queried
        List<Pair<Integer, Integer>> desirableIdPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1Desirable = Pair.of(0, undesirableCategoryIds.get(0));
        desirableIdPairs.add(pair1Desirable);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2Desirable = Pair.of(1, undesirableCategoryIds.get(2));
        desirableIdPairs.add(pair2Desirable);

        String expensesThatShouldBeQueried = addCategoryToListOfExpensesInSpecificPosition(desirableIdPairs,
                "src/test/resources/expenses/singleYear/expensesToBeQueried.json");

        // add expenses that should be queried
        List<CreateExpenseDto> expensesToBeQueried = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesThatShouldBeQueried, expensesToBeQueried);

        // query the expenses
        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/yearly/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesJson = savedExpense.andReturn().getResponse().getContentAsString();
        List<Expense> expensesFromServer = objectMapper.readValue(expensesJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));
        assertEquals(expensesToBeQueried.size(), expensesFromServer.size()); // should be 2

        // compare the expeses that were sent to the server with the ones that were received
        for (int i = 0; i < expensesToBeQueried.size(); i++) {
            int expenseId = expenseIds.get(i);
            CreateExpenseDto sentExpense = expensesToBeQueried.get(i);
            Optional<Expense> receivedExpenseOptional = expensesFromServer.stream().filter(expense -> expense.getId() == expenseId).findAny();
            assertTrue(receivedExpenseOptional.isPresent());
            Expense receivedExpense = receivedExpenseOptional.get();
            assertEquals(sentExpense.amount(), receivedExpense.getAmount());
            assertEquals(sentExpense.categoryId(), receivedExpense.getCategoryId());
            assertEquals(sentExpense.currencyId(), receivedExpense.getCurrencyId());
            assertEquals(sentExpense.date().toString(), receivedExpense.getDate().toString());
            assertEquals(sentExpense.description(), receivedExpense.getDescription());
            if (sentExpense.amount() == 102) {
                assertEquals(9, receivedExpense.getMonth());
            } else {
                assertEquals(11, receivedExpense.getMonth());
            }
            assertEquals(2025, receivedExpense.getYear());
        }

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        for (int expenseId : expenseIdsToIgnore) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        // delete the categories
        for (int categoryId : undesirableCategoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }

    @DisplayName("Expenses of a category for a single year")
    @Test
    public void getExpensesOfACategoryForAYear() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses that will not be queried
        List<Integer> undesirableCategoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/singleYearAndCategory/multipleCategories.json");

        // add the undesirable categories ids to the expenses that should not be qureid
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1 = Pair.of(0, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair1);
        // Expense 2 - Category 2
        Pair<Integer, Integer> pair2 = Pair.of(1, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair2);
        // Expense 3 - Category 1
        Pair<Integer, Integer> pair3 = Pair.of(2, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair3);
        // Expense 4 - Category 2
        Pair<Integer, Integer> pair4 = Pair.of(3, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair4);
        // Expense 5 - Category 1
        Pair<Integer, Integer> pair5 = Pair.of(4, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair5);
        // Expense 6 - Category 3
        Pair<Integer, Integer> pair6 = Pair.of(5, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair6);

        String expenseThatShouldNotBeQueried = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/singleYearAndCategory/expensesNotToQuery.json");

        

        // add expenses that should not be queried
        List<CreateExpenseDto> expensesToSendAndIgnore = new ArrayList<>();
        List<Integer> expenseIdsToIgnore = sendAndSaveExpenses(bearerToken,
                expenseThatShouldNotBeQueried, expensesToSendAndIgnore);

        // category of the expenses that should be queried
        int desirableCategoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/singleYearAndCategory/singleCategory.json");

        // prepare the expenses that should be queried
        // add the category id to the expenses that should be queried
        List<Pair<Integer, Integer>> desirableIdPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1Desirable = Pair.of(0, desirableCategoryId);
        desirableIdPairs.add(pair1Desirable);
        // Expense 2 - Category 1
        Pair<Integer, Integer> pair2Desirable = Pair.of(1, desirableCategoryId);
        desirableIdPairs.add(pair2Desirable);

        String expensesThatShouldBeQueried = addCategoryToListOfExpensesInSpecificPosition(desirableIdPairs,
                "src/test/resources/expenses/singleYearAndCategory/expensesToBeQueried.json");

        // add expenses that should be queried
        List<CreateExpenseDto> expensesToBeQueried = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesThatShouldBeQueried, expensesToBeQueried);

        // query the expenses
        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/single-type?year=2025&categoryId=" + desirableCategoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesJson = savedExpense.andReturn().getResponse().getContentAsString();
        List<Expense> expensesFromServer = objectMapper.readValue(expensesJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));
        assertEquals(expensesToBeQueried.size(), expensesFromServer.size()); // should be 2

        // compare the expeses that were sent to the server with the ones that were received
        for (int i = 0; i < expensesToBeQueried.size(); i++) {
            int expenseId = expenseIds.get(i);
            CreateExpenseDto sentExpense = expensesToBeQueried.get(i);
            Optional<Expense> receivedExpenseOptional = expensesFromServer.stream().filter(expense -> expense.getId() == expenseId).findAny();
            assertTrue(receivedExpenseOptional.isPresent());
            Expense receivedExpense = receivedExpenseOptional.get();
            assertEquals(sentExpense.amount(), receivedExpense.getAmount());
            assertEquals(sentExpense.categoryId(), receivedExpense.getCategoryId());
            assertEquals(sentExpense.currencyId(), receivedExpense.getCurrencyId());
            assertEquals(sentExpense.date().toString(), receivedExpense.getDate().toString());
            assertEquals(sentExpense.description(), receivedExpense.getDescription());
            if (sentExpense.amount() == 102) {
                assertEquals(9, receivedExpense.getMonth());
            } else {
                assertEquals(11, receivedExpense.getMonth());
            }
            assertEquals(2025, receivedExpense.getYear());
        }

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        for (int expenseId : expenseIdsToIgnore) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // delete the categories
        for (int categoryId : undesirableCategoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
        deleteExpenseCategory(bearerToken, desirableCategoryId);
    }

    @DisplayName("Total spent on a year without decimals")
    @Test
    public void getTotalSpentOnAYear() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses
        List<Integer> categoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/totalSpentOnYear/multipleCategories.json");

        // create the pairs
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        int root = 3;
        for (int i = 0; i < 10; i++) { // 10 expenses in totalSPentOnYear.json
            Pair<Integer, Integer> categoryIdPair;
            if (root % 3 == 0) {
                categoryIdPair = Pair.of(i, categoryIds.get(2));
            } else if (root % 3 == 1) {
                categoryIdPair = Pair.of(i, categoryIds.get(1));
            } else {
                categoryIdPair = Pair.of(i, categoryIds.get(0));
            }
            categoryIdsPairs.add(categoryIdPair);
            // increase the root
            if (root == 3) {
                root = 1;
            } else {
                root = root + 1;
            }
        }

        String expensesSerialized = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/totalSpentOnYear/totalSpentOnYear.json");

        List<CreateExpenseDto> expensesForTheYear = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesSerialized, expensesForTheYear);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/total-spent?year=2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"totalSpent\": 400.0}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"totalSpent\":400.0}", totalSpentJson);

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // delete the categories
        for (int categoryId : categoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }

    @DisplayName("Total spent on a year with decimals")
    @Test
    public void getTotalSpentOnAYearWithDecimals() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses
        List<Integer> categoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/totalSpentOnYear/multipleCategories.json");

        // create the pairs
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        int root = 3;
        for (int i = 0; i < 10; i++) { // 10 expenses in totalSPentOnYear.json
            Pair<Integer, Integer> categoryIdPair;
            if (root % 3 == 0) {
                categoryIdPair = Pair.of(i, categoryIds.get(2));
            } else if (root % 3 == 1) {
                categoryIdPair = Pair.of(i, categoryIds.get(1));
            } else {
                categoryIdPair = Pair.of(i, categoryIds.get(0));
            }
            categoryIdsPairs.add(categoryIdPair);
            // increase the root
            if (root == 3) {
                root = 1;
            } else {
                root = root + 1;
            }
        }

        String expensesSerialized = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/totalSpentOnYear/decimals/totalSpentOnAYearWithDecimals.json");

        List<CreateExpenseDto> expensesForTheYear = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesSerialized, expensesForTheYear);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/total-spent?year=2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"totalSpent\": 409.81}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"totalSpent\":409.81}", totalSpentJson);

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // delete the categories
        for (int categoryId : categoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }

    @DisplayName("Total spent on a month with decimals")
    @Test
    public void getTotalSpentOnAMonthWithDecimals() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses
        List<Integer> categoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/totalSpentOnAMonth/multipleCategories.json");

        // create the pairs
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        int root = 3;
        for (int i = 0; i < 10; i++) { // 10 expenses in totalSPentOnYear.json
            Pair<Integer, Integer> categoryIdPair;
            if (root % 3 == 0) {
                categoryIdPair = Pair.of(i, categoryIds.get(2));
            } else if (root % 3 == 1) {
                categoryIdPair = Pair.of(i, categoryIds.get(1));
            } else {
                categoryIdPair = Pair.of(i, categoryIds.get(0));
            }
            categoryIdsPairs.add(categoryIdPair);
            // increase the root
            if (root == 3) {
                root = 1;
            } else {
                root = root + 1;
            }
        }

        String expensesSerialized = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/totalSpentOnAMonth/decimals/totalSpentMonthlyWithDecimals.json");

        List<CreateExpenseDto> expensesSentToServer = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesSerialized, expensesSentToServer);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/total-spent/monthly?year=2025&month=6")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"totalSpent\": 409.81}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"totalSpent\":409.81}", totalSpentJson);

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        // delete the categories
        for (int categoryId : categoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }

    @DisplayName("Total spent on a month in a category")
    @Test
    public void getTotalSpentOnAMonthInACategory() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // create the three categories for the expenses that will not be queried
        List<Integer> undesirableCategoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/totalSpentOnAMonth/multipleCategories.json");

        // add the undesirable categories ids to the expenses that should not be qureid
        List<Pair<Integer, Integer>> categoryIdsPairs = new ArrayList<>();
        // Expense 1 - Category 1 - First == Expense index (number of expense)
        Pair<Integer, Integer> pair1 = Pair.of(0, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair1);
        // Expense 2 - Category 1
        Pair<Integer, Integer> pair2 = Pair.of(1, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair2);
        // Expense 3 - Category 2
        Pair<Integer, Integer> pair3 = Pair.of(2, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair3);
        // Expense 4 - Category 2
        Pair<Integer, Integer> pair4 = Pair.of(3, undesirableCategoryIds.get(1));
        categoryIdsPairs.add(pair4);
        // Expense 5 - Category 1
        Pair<Integer, Integer> pair5 = Pair.of(4, undesirableCategoryIds.get(0));
        categoryIdsPairs.add(pair5);
        // Expense 6 - Category 3
        Pair<Integer, Integer> pair6 = Pair.of(5, undesirableCategoryIds.get(2));
        categoryIdsPairs.add(pair6);

        String expenseThatShouldNotBeQueried = addCategoryToListOfExpensesInSpecificPosition(categoryIdsPairs,
                "src/test/resources/expenses/totalSpentOnAMonth/category/expensesNotToQuery.json");


        // add expenses that should not be queried
        List<CreateExpenseDto> expensesToSendAndIgnore = new ArrayList<>();
        List<Integer> expenseIdsToIgnore = sendAndSaveExpenses(bearerToken,
                expenseThatShouldNotBeQueried, expensesToSendAndIgnore);

        // category of the expenses that should be queried
        int desirableCategoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/totalSpentOnAMonth/category/singleCategory.json");

        // prepare the expenses that should be queried
        // add the category id to the expenses that should be queried
        List<Pair<Integer, Integer>> desirableIdPairs = new ArrayList<>();
        // create the pairs
        for (int i = 0; i < 4; i++) { // 10 expenses in totalSPentOnYear.json
            Pair<Integer, Integer> categoryIdPair = Pair.of(i, desirableCategoryId);
            desirableIdPairs.add(categoryIdPair);
        }

        String expensesThatShouldBeQueried = addCategoryToListOfExpensesInSpecificPosition(desirableIdPairs,
                "src/test/resources/expenses/totalSpentOnAMonth/category/expensesToQuery.json");

        // add expenses that should be queried
        List<CreateExpenseDto> expensesSentToServer = new ArrayList<>();
        List<Integer> expenseIds = sendAndSaveExpenses(bearerToken,
                expensesThatShouldBeQueried, expensesSentToServer);




        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/total-spent/monthly/category?year=2025&month=6&category=" + desirableCategoryId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"totalSpent\": 200.32}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"totalSpent\":200.32}", totalSpentJson);

        // delete the expenses
        for (int expenseId : expenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        for (int expenseId : expenseIdsToIgnore) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        // delete the categories
        for (int categoryId : undesirableCategoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
        deleteExpenseCategory(bearerToken, desirableCategoryId);
    }

    @DisplayName("Modify an expense")
    @Test
    public void modifyExpense() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addCategoryIdToExpense(categoryId, "src/test/resources/expenses/expense.json");

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());
        String expenseId = result.andReturn().getResponse().getContentAsString();

        ResultActions expensesForTheMonthResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesForTheMonthJson = expensesForTheMonthResult.andReturn().getResponse().getContentAsString();
        List<Expense> expensesForTheMonth = objectMapper.readValue(expensesForTheMonthJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));

        assertEquals(1, expensesForTheMonth.size());
        Expense expense = expensesForTheMonth.get(0);
        expense.setAmount(205.10f);
        expense.setDescription("Modified description");


        mockMvc.perform(MockMvcRequestBuilders.post("/expenses/modify")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isNoContent());



        expensesForTheMonthResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());

        expensesForTheMonthJson = expensesForTheMonthResult.andReturn().getResponse().getContentAsString();
        expensesForTheMonth = objectMapper.readValue(expensesForTheMonthJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));
        assertEquals(1, expensesForTheMonth.size());
        Expense modifiedExpense = expensesForTheMonth.get(0);
        assertEquals(205.10f, modifiedExpense.getAmount());
        assertEquals("Modified description", modifiedExpense.getDescription());

        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
    }

    @DisplayName("Modify category and currency of an expense")
    @Test
    public void modifyCategoryOfExpense() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addCategoryIdToExpense(categoryId, "src/test/resources/expenses/modifyCategoryExpense.json");

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());
        String expenseId = result.andReturn().getResponse().getContentAsString();

        ResultActions expensesForTheMonthResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expensesForTheMonthJson = expensesForTheMonthResult.andReturn().getResponse().getContentAsString();
        List<Expense> expensesForTheMonth = objectMapper.readValue(expensesForTheMonthJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));

        int newCategoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");


        assertEquals(1, expensesForTheMonth.size());
        Expense expense = expensesForTheMonth.get(0);
        expense.setCategoryId(newCategoryId);
        expense.setCurrencyId(2); // TODO: make it dynamically



        mockMvc.perform(MockMvcRequestBuilders.post("/expenses/modify")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isNoContent());



        expensesForTheMonthResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());

        expensesForTheMonthJson = expensesForTheMonthResult.andReturn().getResponse().getContentAsString();
        expensesForTheMonth = objectMapper.readValue(expensesForTheMonthJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Expense.class));
        assertEquals(1, expensesForTheMonth.size());
        Expense modifiedExpense = expensesForTheMonth.get(0);
        assertEquals(100f, modifiedExpense.getAmount());
        assertEquals("Test expense description", modifiedExpense.getDescription());
        assertEquals(newCategoryId, modifiedExpense.getCategoryId());
        assertEquals(2, modifiedExpense.getCurrencyId());  //TODO: Make id dynamically

        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
        deleteExpenseCategory(bearerToken, newCategoryId);
    }

    @Test
    public void addAndDeleteExpenseWithTag() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/tags/tagForExpense.json")));
        ResultActions resultOfCreation = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());

        String createdTag = resultOfCreation.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto = objectMapper.readValue(createdTag, GetTagDto.class);

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addTagIdToExpense(createdTagDto.id(), addCategoryIdToExpense(categoryId, "src/test/resources/expenses/tags/expenseWithTag.json"));

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());
        String expenseId = result.andReturn().getResponse().getContentAsString();

        ResultActions expenseResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/get/" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expenseJson = expenseResult.andReturn().getResponse().getContentAsString();
        Expense expense = objectMapper.readValue(expenseJson, Expense.class);
        assertEquals(100f, expense.getAmount());
        assertEquals(expenseId, String.valueOf(expense.getId()));
        assertEquals("Test expense description", expense.getDescription());
        assertEquals(categoryId, expense.getCategoryId());
        assertEquals(1, expense.getCurrencyId());
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", expense.getUserId().toString());
        assertEquals(7, expense.getMonth());
        assertEquals(2025, expense.getYear());
        assertTrue(expense.getWeek() > 0);
        assertEquals("2025-07-05", expense.getDate().toString());
        assertEquals(createdTagDto.id(), expense.getTagId());

        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/tags/delete/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
    }

    @Test
    public void modifyExpenseWithTag() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/tags/tagForExpense.json")));
        ResultActions resultOfCreation = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());

        String createdTag = resultOfCreation.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto = objectMapper.readValue(createdTag, GetTagDto.class);

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addTagIdToExpense(createdTagDto.id(), addCategoryIdToExpense(categoryId, "src/test/resources/expenses/tags/expenseWithTag.json"));

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());
        String expenseId = result.andReturn().getResponse().getContentAsString();

        ResultActions expenseResult = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/get/" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expenseJson = expenseResult.andReturn().getResponse().getContentAsString();
        Expense expense = objectMapper.readValue(expenseJson, Expense.class);

        String tagAsString2 = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/tags/secondTag.json")));
        ResultActions resultOfCreation2 = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString2)
        ).andExpect(status().isOk());

        String createdTag2 = resultOfCreation2.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto2 = objectMapper.readValue(createdTag2, GetTagDto.class);

        // modify the expense
        expense.setTagId(createdTagDto2.id());

        String json2 = objectMapper.writeValueAsString(expense);
        mockMvc.perform(MockMvcRequestBuilders.post("/expenses/modify")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json2))
                .andExpect(status().isNoContent());

        ResultActions expenseResultModified = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/get/" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expenseJsonModified = expenseResultModified.andReturn().getResponse().getContentAsString();
        Expense expenseModified = objectMapper.readValue(expenseJsonModified, Expense.class);

        assertEquals(100f, expenseModified.getAmount());
        assertEquals(expenseId, String.valueOf(expenseModified.getId()));
        assertEquals("Test expense description", expenseModified.getDescription());
        assertEquals(categoryId, expenseModified.getCategoryId());
        assertEquals(1, expenseModified.getCurrencyId());
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", expense.getUserId().toString());
        assertEquals(7, expenseModified.getMonth());
        assertEquals(2025, expenseModified.getYear());
        assertTrue(expenseModified.getWeek() > 0);
        assertEquals("2025-07-05", expenseModified.getDate().toString());
        assertEquals(createdTagDto2.id(), expenseModified.getTagId());


        // Remove the tag
        expenseModified.setTagId(null);
        String json3 = objectMapper.writeValueAsString(expenseModified);
        mockMvc.perform(MockMvcRequestBuilders.post("/expenses/modify")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json3))
                .andExpect(status().isNoContent());

        ResultActions expenseResulNoTag = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/get/" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
        String expenseJsonNoTag = expenseResulNoTag.andReturn().getResponse().getContentAsString();
        Expense expenseNoTag = objectMapper.readValue(expenseJsonNoTag, Expense.class);

        assertEquals(100f, expenseNoTag.getAmount());
        assertEquals(expenseId, String.valueOf(expenseNoTag.getId()));
        assertEquals("Test expense description", expenseNoTag.getDescription());
        assertEquals(categoryId, expenseNoTag.getCategoryId());
        assertEquals(1, expenseNoTag.getCurrencyId());
        //assertEquals("d229217c-d721-4116-9cd2-3dfe03360439", expense.getUserId().toString());
        assertEquals(7, expenseNoTag.getMonth());
        assertEquals(2025, expenseNoTag.getYear());
        assertTrue(expenseNoTag.getWeek() > 0);
        assertEquals("2025-07-05", expenseNoTag.getDate().toString());
        assertNull(expenseNoTag.getTagId());

        mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                        .header("Authorization", bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/tags/delete/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());

        mockMvc.perform(delete("/tags/delete/" + createdTagDto2.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
    }


    @Test
    public void createExpenseWithInvalidTag() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/expenses/tags/tagForExpense.json")));
        ResultActions resultOfCreation = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());

        String createdTag = resultOfCreation.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto = objectMapper.readValue(createdTag, GetTagDto.class);

        int categoryId = createExpenseCategory(bearerToken, "src/test/resources/expenses/category.json");
        String json = addTagIdToExpense(createdTagDto.id() + 1, addCategoryIdToExpense(categoryId, "src/test/resources/expenses/tags/expenseWithTag.json"));

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                        .header("Authorization", bearerToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/tags/delete/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());

        deleteExpenseCategory(bearerToken, categoryId);
    }


    /**
     * Reads the expenses from a file and sends them to the server
     * It populates the expenses list with the expenses that were sent to the server
     *
     * @param bearerToken          the token to authenticate the user
     * @param serializedListOfExpenses the list of expenses as a serliazed string
     * @param expenses             the list of expenses that will be populated with the expenses that were sent to the server
     * @return the ids of the expenses that were sent to the server
     * @throws IOException
     */
    private List<Integer> sendAndSaveExpenses(String bearerToken, String serializedListOfExpenses, List<CreateExpenseDto> expenses) throws Exception {
        List<CreateExpenseDto> serializedExpenses = objectMapper.readValue(serializedListOfExpenses, objectMapper.getTypeFactory().constructCollectionType(List.class, CreateExpenseDto.class));
        expenses.addAll(serializedExpenses);

        List<Integer> expenseIds = new ArrayList<>();
        for (CreateExpenseDto expense : expenses) {
            ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/expenses/add")
                            .header("Authorization", bearerToken)
                            .contentType("application/json")
                            .content(objectMapper.writeValueAsString(expense)))
                    .andExpect(status().isOk());
            String expenseId = result.andReturn().getResponse().getContentAsString();
            expenseIds.add(Integer.parseInt(expenseId));
        }
        return expenseIds;
    }

    /**
     * Send the request to create a new expense category
     * @param bearerToken
     * @param pathToCategoryJson
     * @return
     * @throws Exception
     */
    private int createExpenseCategory(String bearerToken, String pathToCategoryJson) throws Exception {
        String categoryToAdd = new String (Files.readAllBytes(Path.of(pathToCategoryJson)));

        ResultActions result = mockMvc.perform(put("/category/expense/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryToAdd)
        ).andExpect(status().isOk());

        String categoryId = result.andReturn().getResponse().getContentAsString();
        return Integer.parseInt(categoryId);
    }

    /**
     * Adds the category id to the expense that is stored as a json file
     * @param categoryId
     * @param pathToExpenseJson
     * @return
     * @throws IOException
     */
    private String addCategoryIdToExpense(int categoryId, String pathToExpenseJson) throws IOException {
        
        String expenseJson = new String(Files.readAllBytes(Path.of(pathToExpenseJson)));
        CreateExpenseDto expense = objectMapper.readValue(expenseJson, CreateExpenseDto.class);
        CreateExpenseDto modifiedExpense = new CreateExpenseDto(categoryId, expense.amount(), expense.currencyId(), expense.date(), expense.description(), Optional.empty());
        return objectMapper.writeValueAsString(modifiedExpense);
    }

    /**
     * Adds the tag id to the expense
     * @param tagId
     * @param expenseAsJson
     * @return
     * @throws IOException
     */
    private String addTagIdToExpense(int tagId, String expenseAsJson) throws IOException {

        CreateExpenseDto expense = objectMapper.readValue(expenseAsJson, CreateExpenseDto.class);
        CreateExpenseDto modifiedExpense = new CreateExpenseDto(expense.categoryId(), expense.amount(), expense.currencyId(), expense.date(), expense.description(), Optional.of(tagId));
        return objectMapper.writeValueAsString(modifiedExpense);
    }

    /**
     * Adds a categoryId to each expense in a certain position
     * @param categoryIds Pair where the first one represents the index and the second one the categoryId
     * @param pathToListOfExpenses
     * @return the serialized list of expenses
     * @throws IOException
     */
    private String addCategoryToListOfExpensesInSpecificPosition(List<Pair<Integer, Integer>> categoryIds, String pathToListOfExpenses)
            throws IOException {
        String expensesAsJson = new String(Files.readAllBytes(Path.of(pathToListOfExpenses)));
        
        List<CreateExpenseDto> serializedExpenses = objectMapper.readValue(expensesAsJson, objectMapper.getTypeFactory().constructCollectionType(List.class, CreateExpenseDto.class));
        List<CreateExpenseDto> modifiedExpenses = new ArrayList<>();

        for(Pair<Integer, Integer> categoryId : categoryIds) {
            CreateExpenseDto serializedExpense = serializedExpenses.get(categoryId.getFirst());
            CreateExpenseDto modifiedExpense = new CreateExpenseDto(categoryId.getSecond(), serializedExpense.amount(),
                    serializedExpense.currencyId(), serializedExpense.date(), serializedExpense.description(), Optional.empty());
            modifiedExpenses.add(modifiedExpense);
        }
        return objectMapper.writeValueAsString(modifiedExpenses);
    }

    private void deleteExpenseCategory(String bearerToken, int categoryId) throws Exception {
        mockMvc.perform(delete("/category/expense/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    /**
     * Reads a json with multiple categories and creates all of them
     * @param bearerToken
     * @param pathToCategoriesJson
     * @return the list of category ids that were created
     * @throws Exception
     */
    private List<Integer> createMultipleExpenseCategories(String bearerToken, String pathToCategoriesJson)
            throws Exception {
        List<Integer> categoryIds = new ArrayList<>();
        String categoriesToAdd = new String (Files.readAllBytes(Path.of(pathToCategoriesJson)));
        List<CreateExpenseCategoryDto> serializedCategories = objectMapper.readValue(
                categoriesToAdd, objectMapper.getTypeFactory()
                .constructCollectionType(List.class, CreateExpenseCategoryDto.class));

        for (CreateExpenseCategoryDto category : serializedCategories) {

            String categoryToAdd = objectMapper.writeValueAsString(category);
            ResultActions result = mockMvc.perform(put("/category/expense/create")
                    .header("Authorization",bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(categoryToAdd)
            ).andExpect(status().isOk());
            String categoryId = result.andReturn().getResponse().getContentAsString();
            categoryIds.add(Integer.parseInt(categoryId));
        }
        return categoryIds;
    }

    @DisplayName("Compare categories between different time periods")
    @Test
    public void compareCategoriesBetweenPeriods() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        // Create categories
        List<Integer> categoryIds = createMultipleExpenseCategories(bearerToken,
                "src/test/resources/expenses/categoryComparison/categories.json");

        // Add category IDs to January expenses
        List<Pair<Integer, Integer>> januaryCategoryPairs = new ArrayList<>();
        januaryCategoryPairs.add(Pair.of(0, categoryIds.get(0))); // Food expense 1
        januaryCategoryPairs.add(Pair.of(1, categoryIds.get(0))); // Food expense 2
        januaryCategoryPairs.add(Pair.of(2, categoryIds.get(1))); // Transportation expense 1
        januaryCategoryPairs.add(Pair.of(3, categoryIds.get(1))); // Transportation expense 2
        januaryCategoryPairs.add(Pair.of(4, categoryIds.get(2))); // Entertainment expense

        String januaryExpensesJson = addCategoryToListOfExpensesInSpecificPosition(
                januaryCategoryPairs,
                "src/test/resources/expenses/categoryComparison/expensesJanuary2025.json");

        // Add category IDs to February expenses
        List<Pair<Integer, Integer>> februaryCategoryPairs = new ArrayList<>();
        februaryCategoryPairs.add(Pair.of(0, categoryIds.get(0))); // Food expense 1
        februaryCategoryPairs.add(Pair.of(1, categoryIds.get(0))); // Food expense 2
        februaryCategoryPairs.add(Pair.of(2, categoryIds.get(1))); // Transportation expense 1
        februaryCategoryPairs.add(Pair.of(3, categoryIds.get(1))); // Transportation expense 2
        februaryCategoryPairs.add(Pair.of(4, categoryIds.get(2))); // Entertainment expense

        String februaryExpensesJson = addCategoryToListOfExpensesInSpecificPosition(
                februaryCategoryPairs,
                "src/test/resources/expenses/categoryComparison/expensesFebruary2025.json");

        // Save expenses
        
        List<CreateExpenseDto> januaryExpenses = new ArrayList<>();
        List<Integer> januaryExpenseIds = sendAndSaveExpenses(bearerToken, januaryExpensesJson, januaryExpenses);

        List<CreateExpenseDto> februaryExpenses = new ArrayList<>();
        List<Integer> februaryExpenseIds = sendAndSaveExpenses(bearerToken, februaryExpensesJson, februaryExpenses);

        // Call the comparison endpoint
        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.get("/expenses/compare")
                        .header("Authorization", bearerToken)
                        .param("currentPeriodType", "month")
                        .param("currentPeriodValue", "1")
                        .param("previousPeriodType", "month")
                        .param("previousPeriodValue", "2")
                        .param("currentYear", "2025")
                        .param("previousYear", "2025"))
                .andExpect(status().isOk());

        String responseJson = result.andReturn().getResponse().getContentAsString();

        // Print the response for debugging
        System.out.println("[DEBUG_LOG] Response JSON: " + responseJson);

        // Verify the response contains the expected structure
        assertTrue(responseJson.contains("\"currentPeriodLabel\":\"January 2025\""), 
                "Response should contain January 2025 as current period label");
        assertTrue(responseJson.contains("\"previousPeriodLabel\":\"February 2025\""), 
                "Response should contain February 2025 as previous period label");

        // Verify the response contains categories array
        assertTrue(responseJson.contains("\"categories\":["), 
                "Response should contain categories array");

        // Verify each category has the expected fields
        assertTrue(responseJson.contains("\"categoryId\":"), 
                "Response should contain categoryId field");
        assertTrue(responseJson.contains("\"categoryName\":"), 
                "Response should contain categoryName field");
        assertTrue(responseJson.contains("\"currentPeriodAmount\":"), 
                "Response should contain currentPeriodAmount field");
        assertTrue(responseJson.contains("\"previousPeriodAmount\":"), 
                "Response should contain previousPeriodAmount field");
        assertTrue(responseJson.contains("\"difference\":"), 
                "Response should contain difference field");
        assertTrue(responseJson.contains("\"percentageChange\":"), 
                "Response should contain percentageChange field");

        // Verify the response contains totals
        assertTrue(responseJson.contains("\"totalCurrentPeriod\":"), 
                "Response should contain totalCurrentPeriod field");
        assertTrue(responseJson.contains("\"totalPreviousPeriod\":"), 
                "Response should contain totalPreviousPeriod field");
        assertTrue(responseJson.contains("\"totalDifference\":"), 
                "Response should contain totalDifference field");
        assertTrue(responseJson.contains("\"totalPercentageChange\":"), 
                "Response should contain totalPercentageChange field");

        // Clean up
        for (int expenseId : januaryExpenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        for (int expenseId : februaryExpenseIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/expenses/delete?expenseId=" + expenseId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }

        for (int categoryId : categoryIds) {
            deleteExpenseCategory(bearerToken, categoryId);
        }
    }
}
