package com.api.expenses.rest.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Date;

@Entity
@Table(name = "expenses")
public class Expense extends Transaction {

    @JsonIgnore
    @ManyToOne(
            cascade = CascadeType.PERSIST,
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "category_id",
            referencedColumnName = "id",
            nullable = false
    )
    private ExpenseCategory category;

    @Column(name = "category_id", insertable = false, updatable = false)
    private int categoryId;

    public Expense() {
        super();
    }

    public Expense(int id, User user, ExpenseCategory category, float amount, Date date,
                   String description, int month, int year, int week, Currency currency, Tag tag) {
        super(id, user, amount, date, description, month, year, week, currency, tag);
        this.category = category;
    }

    public Expense(User user, ExpenseCategory expenseCategory, float amount, Date date,
                   String description, int month, int year, int week, Currency currency, Tag tag) {
        super(user, amount, date, description, month, year, week, currency, tag);
        this.category = expenseCategory;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory expenseCategory) {
        this.category = expenseCategory;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

}
