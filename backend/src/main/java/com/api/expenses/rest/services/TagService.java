package com.api.expenses.rest.services;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.models.Tag;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.models.dtos.CreateTagDto;
import com.api.expenses.rest.models.dtos.GetTagDto;
import com.api.expenses.rest.models.dtos.UpdateTagDto;
import com.api.expenses.rest.repositories.TagRepository;
import com.api.expenses.rest.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    @Autowired
    public TagService(TagRepository tagRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    public List<GetTagDto> getTagsByUserId(UUID userId) {
        List<Tag> tags = tagRepository.findByUserId(userId);
        return tags.stream()
                .map(tag -> new GetTagDto(tag.getId(), tag.getName(), tag.getDescription(),tag.getUserId()))
                .collect(Collectors.toList());
    }

    public GetTagDto getTagById(int tagId, UUID userId) throws TransactionException {
        Optional<Tag> tagOptional = tagRepository.findById(tagId);
        if (tagOptional.isEmpty()) {
            throw new TransactionException(TransactionException.TransactionExceptionType.TAG_NOT_FOUND);
        }
        
        Tag tag = tagOptional.get();
        if (!tag.getUserId().equals(userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.UNAUTHORIZED);
        }
        
        return new GetTagDto(tag.getId(), tag.getName(), tag.getDescription(),tag.getUserId());
    }

    public Tag createTag(CreateTagDto createTagDto, UUID userId) throws TransactionException {
        if (tagRepository.existsByNameAndUserId(createTagDto.name(), userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.TAG_ALREADY_EXISTS);
        }
        
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new TransactionException(TransactionException.TransactionExceptionType.USER_NOT_FOUND);
        }
        
        Tag tag = new Tag(createTagDto.name(), createTagDto.description(),userOptional.get());
        Tag savedTag = tagRepository.save(tag);
        return savedTag;
    }

    public void updateTag(int tagId, UpdateTagDto updateTagDto, UUID userId) throws TransactionException {
        Optional<Tag> tagOptional = tagRepository.findById(tagId);
        if (tagOptional.isEmpty()) {
            throw new TransactionException(TransactionException.TransactionExceptionType.TAG_NOT_FOUND);
        }
        
        Tag tag = tagOptional.get();
        if (!tag.getUserId().equals(userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.UNAUTHORIZED);
        }
        
        // Check if the new name already exists for another tag
        if (!tag.getName().equals(updateTagDto.name()) && 
            tagRepository.existsByNameAndUserId(updateTagDto.name(), userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.TAG_ALREADY_EXISTS);
        }
        
        tag.setName(updateTagDto.name());
        tag.setDescription(updateTagDto.description());
        tagRepository.save(tag);
    }

    public void deleteTag(int tagId, UUID userId) throws TransactionException {
        Optional<Tag> tagOptional = tagRepository.findById(tagId);
        if (tagOptional.isEmpty()) {
            throw new TransactionException(TransactionException.TransactionExceptionType.TAG_NOT_FOUND);
        }
        
        Tag tag = tagOptional.get();
        if (!tag.getUserId().equals(userId)) {
            throw new TransactionException(TransactionException.TransactionExceptionType.UNAUTHORIZED);
        }
        
        tagRepository.delete(tag);
    }
}