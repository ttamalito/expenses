package com.api.expenses.rest.repositories;

import com.api.expenses.rest.models.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, Integer> {
    
    List<Tag> findByUserId(UUID userId);
    
    boolean existsByNameAndUserId(String name, UUID userId);
}