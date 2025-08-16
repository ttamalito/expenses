package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.Income;
import com.api.expenses.rest.models.dtos.CreateIncomeDto;
import com.api.expenses.rest.models.dtos.GetIncomeDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import org.junit.jupiter.api.BeforeAll;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class IncomesControllerTestsIT {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public IncomesControllerTestsIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @BeforeEach
    public void setup() throws Exception {
        objectMapper.registerModule(new Jdk8Module());
    }
    @Test
    @DisplayName("Add income and delete it")
    public void addIncomeAndDeleteIt() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomeAsJsonString = addCategoryIdToIncome(categoryId, "src/test/resources/incomes/validIncomeToAdd.json");

        ResultActions result = mockMvc.perform(post("/incomes/add")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(incomeAsJsonString)
        ).andExpect(status().isOk());

        String incomeId = result.andReturn().getResponse().getContentAsString().split(":")[1].replace("\"", "").replace("}", "");

        ResultActions incomeFetchResult = mockMvc.perform(get("/incomes/get/" + incomeId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String incomeFetchResultString = incomeFetchResult.andReturn().getResponse().getContentAsString();

        GetIncomeDto income = objectMapper.readValue(incomeFetchResultString, GetIncomeDto.class);

        assertEquals(1000.32f, income.amount());
        assertEquals("2025-01-05", income.date().toString());
        assertEquals(categoryId, income.categoryId());
        assertEquals(1, income.currencyId());
        assertEquals("Test income description", income.description());
        assertEquals(2, income.week());
        assertEquals(2025, income.year());
        assertEquals(1, income.month());

        mockMvc.perform(delete("/incomes/delete/" + incomeId)
                .header("Authorization",bearerToken)
        ).andExpect(status().isNoContent());

        deleteIncomeCategory(bearerToken, categoryId);
    }


    @Test
    @DisplayName("Test total earned in a year")
    public void totalEarnedInAYearTest() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );
        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomesAsString = addCategoryToListOfIncomes(categoryId, "src/test/resources/incomes/totalEarnedYear/totalEarnedYear.json");
        List<CreateIncomeDto> incomeRequestList = new ArrayList<>();
        List<Integer> incomesIds = sendAndSaveIncomes(bearerToken,
                incomesAsString, incomeRequestList);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/incomes/total-earned/year?year=2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"total\": 1002.49}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"total\": 1002.49}", totalSpentJson);

        // delete the incomes
        for (int incomeId : incomesIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/incomes/delete/" + incomeId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        deleteIncomeCategory(bearerToken, categoryId);
    }

    @Test
    @DisplayName("Test total earned in a month")
    public void totalEarnedInAMonthTest() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomesAsString = addCategoryToListOfIncomes(categoryId, "src/test/resources/incomes/totalEarnedMonth/totalEarnedMonth.json");
        List<CreateIncomeDto> incomeRequestList = new ArrayList<>();
        List<Integer> incomesIds = sendAndSaveIncomes(bearerToken,
                incomesAsString, incomeRequestList);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/incomes/total-earned/month?year=2025&month=1")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().json("{\"total\": 1002.49}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"total\": 1002.49}", totalSpentJson);

        // delete the incomes
        for (int incomeId : incomesIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/incomes/delete/" + incomeId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        deleteIncomeCategory(bearerToken, categoryId);
    }

    @Test
    @DisplayName("Test total earned in a monthly basis")
    public void totalEarnedInAMonthlyBasisTest() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomesAsString = addCategoryToListOfIncomes(categoryId, "src/test/resources/incomes/totalEarnedMonthlyBasis/totalEarnedMonthlyBasis.json");
        List<CreateIncomeDto> incomeRequestList = new ArrayList<>();
        List<Integer> incomesIds = sendAndSaveIncomes(bearerToken,
                incomesAsString, incomeRequestList);

        ResultActions savedExpense = mockMvc.perform(MockMvcRequestBuilders.get("/incomes/earned/year/monthly?year=2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"));
                //.andExpect(content().json("{\"totals\": ["3007.47","6000.03","300.00","3000.96","303.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00"]}"));

        String totalSpentJson = savedExpense.andReturn().getResponse().getContentAsString();
        assertEquals("{\"totals\": [\"1002.49\",\"2000.01\",\"100.00\",\"1000.32\",\"101.00\",\"0.00\",\"0.00\",\"0.00\",\"0.00\",\"0.00\",\"0.00\",\"0.00\"]}", totalSpentJson);

        // delete the incomes
        for (int incomeId : incomesIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/incomes/delete/" + incomeId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        deleteIncomeCategory(bearerToken, categoryId);
    }

    @Test
    @DisplayName("Test get incomes for a month")
    public void getIncomesForAMonthTest() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomesAsString = addCategoryToListOfIncomes(categoryId, "src/test/resources/incomes/getIncomesForAMonth/incomes.json");
        List<CreateIncomeDto> incomeRequestList = new ArrayList<>();
        List<Integer> incomesIds = sendAndSaveIncomes(bearerToken,
                incomesAsString, incomeRequestList);

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.get("/incomes/monthly/1/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String responseJson = result.andReturn().getResponse().getContentAsString();
        List<GetIncomeDto> incomes = objectMapper.readValue(responseJson, objectMapper.getTypeFactory().constructCollectionType(List.class, GetIncomeDto.class));

        // Verify that we got the expected number of incomes
        assertEquals(3, incomes.size());

        // Verify that all incomes have the expected month and year
        for (GetIncomeDto income : incomes) {
            assertEquals(1, income.month());
            assertEquals(2025, income.year());
        }

        // delete the incomes
        for (int incomeId : incomesIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/incomes/delete/" + incomeId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        deleteIncomeCategory(bearerToken, categoryId);
    }

    @Test
    @DisplayName("Test get incomes for a year")
    public void getIncomesForAYearTest() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        int categoryId = createIncomeCategory(bearerToken, "src/test/resources/incomes/category.json");
        String incomesAsString = addCategoryToListOfIncomes(categoryId, "src/test/resources/incomes/totalEarnedYear/totalEarnedYear.json");
        List<CreateIncomeDto> incomeRequestList = new ArrayList<>();
        List<Integer> incomesIds = sendAndSaveIncomes(bearerToken,
                incomesAsString, incomeRequestList);

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.get("/incomes/yearly/2025")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String responseJson = result.andReturn().getResponse().getContentAsString();
        List<GetIncomeDto> incomes = objectMapper.readValue(responseJson, objectMapper.getTypeFactory().constructCollectionType(List.class, GetIncomeDto.class));

        // Verify that we got the expected number of incomes
        assertEquals(3, incomes.size());

        // Verify that all incomes have the expected year
        for (GetIncomeDto income : incomes) {
            assertEquals(2025, income.year());
        }

        // delete the incomes
        for (int incomeId : incomesIds) {
            mockMvc.perform(MockMvcRequestBuilders.delete("/incomes/delete/" + incomeId)
                            .header("Authorization", bearerToken))
                    .andExpect(status().isNoContent());
        }
        deleteIncomeCategory(bearerToken, categoryId);
    }

    /**
     * Reads the incomes from a file and sends them to the server
     * It populates the incomes list with the incomes that were sent to the server
     *
     * @param bearerToken          the token to authenticate the user
     * @param serializedIncomesList the list of incomes as a string
     * @param incomes             the list of incomes that will be populated with the incomes that were sent to the server
     * @return the ids of the incomes that were sent to the server
     * @throws IOException
     */
    private List<Integer> sendAndSaveIncomes(String bearerToken, String serializedIncomesList, List<CreateIncomeDto> incomes) throws Exception {
        List<CreateIncomeDto> serializedIncomes = objectMapper.readValue(serializedIncomesList, objectMapper.getTypeFactory().constructCollectionType(List.class, CreateIncomeDto.class));
        incomes.addAll(serializedIncomes);

        List<Integer> incomesIds = new ArrayList<>();
        for (CreateIncomeDto income : incomes) {
            ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/incomes/add")
                            .header("Authorization", bearerToken)
                            .contentType("application/json")
                            .content(objectMapper.writeValueAsString(income)))
                    .andExpect(status().isOk());
            String incomeId = result.andReturn().getResponse().getContentAsString().split(":")[1].replace("\"", "").replace("}", "").replace(" ", "");
            incomesIds.add(Integer.parseInt(incomeId));
        }
        return incomesIds;
    }

    private void deleteIncomeCategory(String bearerToken, int categoryId) throws Exception {
        mockMvc.perform(delete("/category/income/delete/" + categoryId)
                .header("Authorization", bearerToken)
        ).andExpect(status().isNoContent());
    }

    /**
     * Adds the category id to the expense that is stored as a json file
     * @param categoryId
     * @param pathToExpenseJson
     * @return the serialized income
     * @throws IOException
     */
    private String addCategoryIdToIncome(int categoryId, String pathToExpenseJson) throws IOException {
        String expenseJson = new String(Files.readAllBytes(Path.of(pathToExpenseJson)));
        CreateIncomeDto income = objectMapper.readValue(expenseJson, CreateIncomeDto.class);
        CreateIncomeDto modifiedIncome = new CreateIncomeDto(categoryId, income.amount(), income.date(), income.currencyId(), income.description(), Optional.empty());
        return objectMapper.writeValueAsString(modifiedIncome);
    }

    /**
     * Send the request to create a new income category
     * @param bearerToken
     * @param pathToCategoryJson
     * @return
     * @throws Exception
     */
    private int createIncomeCategory(String bearerToken, String pathToCategoryJson) throws Exception {
        String categoryToAdd = new String (Files.readAllBytes(Path.of(pathToCategoryJson)));

        ResultActions result = mockMvc.perform(put("/category/income/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryToAdd)
        ).andExpect(status().isOk());

        String categoryId = result.andReturn().getResponse().getContentAsString();
        return Integer.parseInt(categoryId);
    }

    private String addCategoryToListOfIncomes(int categoryId, String pathToListOfIncomes)
            throws IOException {
        String incomesAsJson = new String(Files.readAllBytes(Path.of(pathToListOfIncomes)));
        List<CreateIncomeDto> serializedIncomes = objectMapper.readValue(incomesAsJson, objectMapper.getTypeFactory().constructCollectionType(List.class, CreateIncomeDto.class));
        List<CreateIncomeDto> modifiedIncomes = new ArrayList<>();

        for(CreateIncomeDto income : serializedIncomes) {
            CreateIncomeDto modifiedIncome = new CreateIncomeDto(categoryId, income.amount(), income.date(), income.currencyId(), income.description(), Optional.empty());
            modifiedIncomes.add(modifiedIncome);
        }

        return objectMapper.writeValueAsString(modifiedIncomes);
    }
    
}
