package com.api.expenses.rest.services;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.repositories.ExpenseCategoryRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final ExpenseService expenseService;

    public ExpenseCategoryService(@Lazy ExpenseCategoryRepository expenseCategoryRepository, @Lazy ExpenseService expenseService) {
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.expenseService = expenseService;
    }

    public boolean categoryExists(int categoryId) {
        return expenseCategoryRepository.existsById(categoryId);
    }

    public Optional<ExpenseCategory> getCategoryById(int categoryId) {
        return expenseCategoryRepository.findById(categoryId);
    }

    public List<ExpenseCategory> getCategoriesForUser(UUID userId) {
        return expenseCategoryRepository.findByUserId(userId);
    }

    public ExpenseCategory saveCategory(ExpenseCategory category) {
        return expenseCategoryRepository.save(category);
    }

    public void deleteCategory(int categoryId) throws TransactionException {
        if (expenseService.hasExpensesLinkedToCategory(categoryId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.CATEGORY_HAS_LINKED_EXPENSES);
        }
        expenseCategoryRepository.deleteById(categoryId);
    }


    /**
     * Creates a new expense category in the database
     */
    public int createCategory(ExpenseCategory category) {

        ExpenseCategory savedCategory = expenseCategoryRepository.save(category);
        return savedCategory.getId();
    }

    /**
     * Gets all expense categories from the database
     * @return a list of all expense categories
     */
    public List<ExpenseCategory> getAllCategories() {
        return expenseCategoryRepository.findAll();
    }
}
