package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.api.expenses.rest.models.dtos.StatisticalSummaryDto;
import com.api.expenses.rest.services.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controller for statistics-related endpoints.
 */
@RestController
@RequestMapping(value = "/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Get statistical summaries for the current user.
     * 
     * @return a StatisticalSummaryDto containing various financial statistics
     */
    @GetMapping("/summary")
    public ResponseEntity<StatisticalSummaryDto> getStatisticalSummary() {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        
        try {
            StatisticalSummaryDto summary = statisticsService.getStatisticalSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (UserException e) {
            return ResponseEntity.notFound().build();
        } catch (TransactionException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}