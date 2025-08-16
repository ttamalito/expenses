package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.models.Income;
import com.api.expenses.rest.models.dtos.CreateIncomeDto;
import com.api.expenses.rest.models.dtos.GetIncomeDto;
import com.api.expenses.rest.services.IncomeService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/incomes")
public class IncomesController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final IncomeService incomeService;

    @Autowired
    public IncomesController(@Lazy IncomeService incomeService) {
        objectMapper.registerModule(new Jdk8Module());
        this.incomeService = incomeService;
    }


    @PostMapping("/add")
    public ResponseEntity<String> addIncome(@RequestBody CreateIncomeDto income) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            int incomeId = incomeService.saveIncome(income, userId);
            String incomeIdJson = String.format("{\"incomeId\": %d}", incomeId);
            return ResponseEntity.ok(incomeIdJson);
        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteIncome(@PathVariable int id) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        if (!incomeService.incomeExists(id)) {
            return ResponseEntity.badRequest().body("Income not found");
        }
        Income income = incomeService.getIncomeById(id).get();
        if (!income.getUser().getId().equals(userId)) {
            return ResponseEntity.badRequest().body("Unauthorized");
        }

        try {
            incomeService.deleteIncome(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<GetIncomeDto> getIncomeById(@PathVariable int id) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            Optional<Income> income = incomeService.getIncomeById(id);
            if (income.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (!income.get().getUser().getId().equals(userId)) {
                return ResponseEntity.badRequest().build();
            }

            Income incomeObj = income.get();
            GetIncomeDto incomeDto = new GetIncomeDto(
                incomeObj.getId(),
                incomeObj.getUserId(),
                incomeObj.getAmount(),
                incomeObj.getCurrencyId(),
                incomeObj.getDate(),
                incomeObj.getDescription(),
                incomeObj.getMonth(),
                incomeObj.getYear(),
                incomeObj.getWeek(),
                incomeObj.getLastUpdate(),
                incomeObj.getCategoryId(),
                incomeObj.getTagId() != null ? Optional.of(incomeObj.getTagId()) : Optional.empty()
            );

            return ResponseEntity.ok(incomeDto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/total-earned/year")
    public ResponseEntity<String> getTotalEarnedForAYear(@RequestParam int year) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            float total = incomeService.getTotalEarnedForAYearForAUser(userId, year);
            String response = String.format("{\"total\": %.2f}", total);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);

        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }
    }
     @GetMapping("/total-earned/month")
    public ResponseEntity<String> getTotalEarnedInAMonth(@RequestParam int month, @RequestParam int year) {

        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        try {
            float total = incomeService.getTotalEarnedForAMonthForAUser(userId, month, year);
            String response = String.format("{\"total\": %.2f}", total);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);

        } catch (Exception e) {
            return ControllersHelper.handleException(e);
        }
     }

     @GetMapping("/earned/year/monthly")
    public ResponseEntity<String> getTotalEarnedInAYearInAMonthlyBasis(@RequestParam int year) {

        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        try {
            List<Float> totals = incomeService.getTotalEarnedInAYearInAMonthlyBasis(userId, year);
            // write each float as string with maximum 2 decimals
            List<String> totalsFormatted  = new ArrayList<>();
            for (float total : totals) {
                totalsFormatted.add(String.format("%.2f", total));
            }
            String totalsJson = objectMapper.writeValueAsString(totalsFormatted);
            String response = String.format("{\"totals\": %s}", totalsJson);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response);
        } catch (JsonProcessingException e) {
            return ControllersHelper.handleException(e);
        }
     }

    @GetMapping("/monthly/{month}/{year}")
    public ResponseEntity<String> getIncomesForAMonth(@PathVariable int month, @PathVariable int year) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            List<Income> incomes = incomeService.getIncomesForAMonthOfAUser(userId, month, year);
            List<GetIncomeDto> incomeDtos = new ArrayList<>();

            for (Income income : incomes) {
                GetIncomeDto incomeDto = new GetIncomeDto(
                    income.getId(),
                    income.getUserId(),
                    income.getAmount(),
                    income.getCurrencyId(),
                    income.getDate(),
                    income.getDescription(),
                    income.getMonth(),
                    income.getYear(),
                    income.getWeek(),
                    income.getLastUpdate(),
                    income.getCategoryId(),
                    income.getTagId() != null ? Optional.of(income.getTagId()) : Optional.empty()
                );
                incomeDtos.add(incomeDto);
            }

            String incomesJson = objectMapper.writeValueAsString(incomeDtos);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(incomesJson);
        } catch (JsonProcessingException e) {
            return ControllersHelper.handleException(e);
        }
    }

    @GetMapping("/yearly/{year}")
    public ResponseEntity<String> getIncomesForAYear(@PathVariable int year) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();

        try {
            List<Income> incomes = incomeService.getIncomesForAYearOfAUser(userId, year);
            List<GetIncomeDto> incomeDtos = new ArrayList<>();

            for (Income income : incomes) {
                GetIncomeDto incomeDto = new GetIncomeDto(
                    income.getId(),
                    income.getUserId(),
                    income.getAmount(),
                    income.getCurrencyId(),
                    income.getDate(),
                    income.getDescription(),
                    income.getMonth(),
                    income.getYear(),
                    income.getWeek(),
                    income.getLastUpdate(),
                    income.getCategoryId(),
                    income.getTagId() != null ? Optional.of(income.getTagId()) : Optional.empty()
                );
                incomeDtos.add(incomeDto);
            }

            String incomesJson = objectMapper.writeValueAsString(incomeDtos);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(incomesJson);
        } catch (JsonProcessingException e) {
            return ControllersHelper.handleException(e);
        }
    }
}
