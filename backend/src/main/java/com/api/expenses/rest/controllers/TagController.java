package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.ControllersHelper;
import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.models.Tag;
import com.api.expenses.rest.models.dtos.CreateTagDto;
import com.api.expenses.rest.models.dtos.GetTagDto;
import com.api.expenses.rest.models.dtos.UpdateTagDto;
import com.api.expenses.rest.services.TagService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/tags", produces = { MediaType.APPLICATION_JSON_VALUE })
public class TagController {

    private final TagService tagService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTagById(@PathVariable int id) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        
        try {
            GetTagDto tag = tagService.getTagById(id, userId);
            return ResponseEntity.ok(tag);
        } catch (TransactionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<GetTagDto>> getTagsForUser() {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        List<GetTagDto> tags = tagService.getTagsByUserId(userId);
        return ResponseEntity.ok().body(tags);
    }

    @PostMapping("/create")
    public ResponseEntity<GetTagDto> createTag(@RequestBody CreateTagDto createTagDto) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        
        try {
            Tag createdTag = tagService.createTag(createTagDto, userId);
            GetTagDto tag = new GetTagDto(createdTag.getId(), createdTag.getName(), createdTag.getDescription(),userId);
            return ResponseEntity.ok().body(tag);
        } catch (TransactionException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTag(@PathVariable int id, @RequestBody UpdateTagDto updateTagDto) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        
        try {
            tagService.updateTag(id, updateTagDto, userId);
            return ResponseEntity.noContent().build();
        } catch (TransactionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable int id) {
        UUID userId = ControllersHelper.getUserIdFromSecurityContextHolder();
        
        try {
            tagService.deleteTag(id, userId);
            return ResponseEntity.noContent().build();
        } catch (TransactionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}