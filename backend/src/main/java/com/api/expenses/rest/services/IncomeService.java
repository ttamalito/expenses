package com.api.expenses.rest.services;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.models.*;
import com.api.expenses.rest.models.dtos.CreateIncomeDto;
import com.api.expenses.rest.models.dtos.GetTagDto;
import com.api.expenses.rest.repositories.IncomeRepository;
import com.api.expenses.rest.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserService userService;
    private final IncomeCategoryService incomeCategoryService;
    private final CurrencyService currencyService;
    private final TagService tagService;

    @Autowired
    public IncomeService(IncomeRepository incomeRepository, UserService userService,
                         IncomeCategoryService incomeCategoryService, CurrencyService currencyService,
                         TagService tagService) {
        this.incomeRepository = incomeRepository;
        this.userService = userService;
        this.incomeCategoryService = incomeCategoryService;
        this.currencyService = currencyService;
        this.tagService = tagService;
    }

    public boolean incomeExists(int incomeId) {
        return incomeRepository.existsById(incomeId);
    }

    public Optional<Income> getIncomeById(int incomeId) {
        return incomeRepository.findById(incomeId);
    }

    /**
     * Save an income to the database
     * @param incomeFromRequest
     * @param userId
     * @return the id of the saved income
     * @throws TransactionException if the user, category or currency is not found
     */
    public int saveIncome(CreateIncomeDto incomeFromRequest, UUID userId) throws TransactionException {
        User user = userService.getUserById(userId).orElseThrow(
                () -> new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND)
        );

        IncomeCategory incomeCategory = incomeCategoryService.getCategoryById(incomeFromRequest.categoryId()).orElseThrow(
                () -> new TransactionException(TransactionException.TransactionExceptionType.CATEGORY_NOT_FOUND)
        );

        Currency currency = currencyService.getCurrencyById(incomeFromRequest.currencyId()).orElseThrow(
                () -> new TransactionException(TransactionException.TransactionExceptionType.CURRENCY_NOT_FOUND)
        );

        Tag tag = null;
        if (incomeFromRequest.tagId().isPresent()) {
            try {
                GetTagDto tagDto = tagService.getTagById(incomeFromRequest.tagId().get(), userId);
                tag = new Tag(tagDto.id(), tagDto.name(), tagDto.description(), user);
            } catch (TransactionException e) {
                throw new TransactionException(TransactionException.TransactionExceptionType.TAG_NOT_FOUND);
            }
        }

        if (incomeFromRequest.amount() <= 0) {
            throw new TransactionException(TransactionException.TransactionExceptionType.INVALID_AMOUNT);
        }

        Date date = incomeFromRequest.date();

        final int week = DateUtils.getWeekOfTheYear(date);
        final int month = DateUtils.getMonthOfTheYear(date);
        final int year = DateUtils.getYearOfTheDate(date);

        Income income = new Income(
                user,
                incomeCategory,
                incomeFromRequest.amount(),
                date,
                incomeFromRequest.description(),
                month,
                year,
                week,
                currency,
                tag
        );
        return incomeRepository.save(income).getId();
    }

    public void deleteIncome(int incomeId) {
        incomeRepository.deleteById(incomeId);
    }

    public void updateIncome(Income income) {
        incomeRepository.save(income);
    }

    public List<Income> getIncomesForAMonthOfAUser(UUID userId, int month, int year) {
        return incomeRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    public List<Income> getIncomesForAYearOfAUser(UUID userId, int year) {
        return incomeRepository.findByUserIdAndYear(userId, year);
    }

    public float getTotalEarnedForAYearForAUser(UUID userId, int year) {
        List<Income> incomes = getIncomesForAYearOfAUser(userId, year);
        float total = 0;
        for (Income income : incomes) {
            total += income.getAmount();
        }
        return total;
    }

    public float getTotalEarnedForAMonthForAUser(UUID userId, int month, int year) {
        List<Income> incomes = getIncomesForAMonthOfAUser(userId, month, year);
        float total = 0;
        for (Income income : incomes) {
            total += income.getAmount();
        }
        return total;
    }

    public List<Float> getTotalEarnedInAYearInAMonthlyBasis(UUID userId, int year) {
        List<Float> totals = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            float total = getTotalEarnedForAMonthForAUser(userId, i, year);
            totals.add(total);
//            System.out.println("Month: " + i + " Total: " + total);
        }
        return totals;
    }

    public List<Income> getIncomesForAMonthOfAUserByCategory(UUID userId, int month, int year, int categoryId) {
        return incomeRepository.findByUserIdAndMonthAndYearAndCategoryId(userId, month, year, categoryId);
    }

    public List<Income> getIncomesForAWeekOfAUser(UUID userId, int week, int year) {
        return incomeRepository.findByUserIdAndWeekAndYear(userId, week, year);
    }

    public List<Income> getAllIncomesOfAUser(UUID userId) {
        return incomeRepository.findByUserId(userId);
    }

    public boolean hasIncomesLinkedToCategory(int categoryId) {
        return incomeRepository.countByCategoryId(categoryId) > 0;
    }

    /**
     * Gets all incomes from the database
     * @return a list of all incomes
     */
    public List<Income> getAllIncomes() {
        return incomeRepository.findAll();
    }
}
