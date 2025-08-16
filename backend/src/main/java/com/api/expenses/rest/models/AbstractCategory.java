package com.api.expenses.rest.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@MappedSuperclass
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class AbstractCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Access(AccessType.PROPERTY) // Only fetch the id
    private int id;

    @JsonIgnore
    @ManyToOne(
            cascade = CascadeType.MERGE, // when a category is deleted, the user will NOT be deleted
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "id",
            nullable = false
            //foreignKey = @ForeignKey(name = "fk_category_user_id_"), fk must be unique
    )
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;
    private String description;



    public AbstractCategory() {
    }

    public AbstractCategory(int id, User user, String name, String description) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.description = description;
    }
    public AbstractCategory(User user, String name, String description) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.description = description;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
