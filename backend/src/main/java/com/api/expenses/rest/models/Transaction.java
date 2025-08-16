package com.api.expenses.rest.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Date;
import java.util.UUID;


@JsonInclude(JsonInclude.Include.NON_NULL)
@MappedSuperclass // Abstract class is not mapped, but its subclasses are
public abstract class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @JsonIgnore
    @ManyToOne(
            cascade = CascadeType.PERSIST,
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "id",
            nullable = false
    )
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private UUID userId; // the user of a transaction cannot be changed

    @Column(nullable = false)
    private float amount;

    @JsonIgnore
    @ManyToOne(
            cascade = CascadeType.PERSIST,
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "currency_id",
            referencedColumnName = "id",
            nullable = false
    )
    private Currency currency;

    @Column(name = "currency_id", insertable = false, updatable = false)
    private int currencyId;

    //private Currency currency;

    @JsonIgnore
    @ManyToOne(
            cascade = CascadeType.MERGE, // TODO: Check this
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "tag_id",
            referencedColumnName = "id",
            nullable = true
    )
    private Tag tag;

    @Column(name = "tag_id", insertable = false, updatable = false)
    private Integer tagId;

    @Column(nullable = false)
    private Date date;
    private String description;
    @Column(nullable = false)
    private int month;
    @Column(nullable = false)
    private int year;
    @Column(nullable = false)
    private int week;
    @UpdateTimestamp
    private Date lastUpdate;

    public Transaction() {
    }

    public Transaction(int id, User user,
                       float amount,
                       Date date,
                       String description,
                       int month,
                       int year,
                       int week,
                       Currency currency,
                       Tag tag) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.date = date;
        this.description = description;
        this.month = month;
        this.year = year;
        this.week = week;
        this.currency = currency;
        this.tag = tag;
    }

    public Transaction(User user,
                       float amount,
                       Date date,
                       String description,
                       int month,
                       int year,
                       int week,
                       Currency currency,
                       Tag tag) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.date = date;
        this.description = description;
        this.month = month;
        this.year = year;
        this.week = week;
        this.currency = currency;
        this.tag = tag;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User userId) {
        this.user = userId;
    }

    public float getAmount() {
        return amount;
    }

    public void setAmount(float amount) {
        this.amount = amount;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getWeek() {
        return week;
    }

    public void setWeek(int week) {
        this.week = week;
    }

    public Date getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public int getCurrencyId() {
        return currencyId;
    }

    public void setCurrencyId(int currencyId) {
        this.currencyId = currencyId;
    }

    public Integer getTagId() {
        return tagId;
    }
    public void setTagId(Integer tagId) {
        this.tagId = tagId;
    }
    public Tag getTag() {
        return tag;
    }
    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
