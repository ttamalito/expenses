package com.api.expenses.rest.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.sql.Date;

@Entity
@Table(name = "incomes")
public class Income extends Transaction implements Serializable {

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
    private IncomeCategory category;

    @Column(name = "category_id", insertable = false, updatable = false)
    private int categoryId;


    public Income() {
        super();
    }

    public Income(int id, User user,
                   IncomeCategory category,
                   float amount,
                   Date date,
                   String description,
                   int month,
                   int year,
                   int week,
                   Currency currency,
                  Tag tag) {
        super(id, user, amount, date,  description, month, year, week, currency, tag);
        this.category = category;
    }
    public Income(User user,
                  IncomeCategory category,
                  float amount,
                  Date date,
                  String description,
                  int month,
                  int year,
                  int week,
                  Currency currency,
                  Tag tag) {
        super(user, amount, date,  description, month, year, week, currency, tag);
        this.category = category;
    }

    public IncomeCategory getCategory() {
        return category;
    }

    public void setCategory(IncomeCategory category) {
        this.category = category;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }
}
