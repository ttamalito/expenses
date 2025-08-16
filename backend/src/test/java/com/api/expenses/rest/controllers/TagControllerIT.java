package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.dtos.CreateTagDto;
import com.api.expenses.rest.models.dtos.GetTagDto;
import com.api.expenses.rest.models.dtos.UpdateTagDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TagControllerIT {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public TagControllerIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }


    @Test
    @DisplayName("Create, Update, Delete one tag")
    public void crudTag() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/tags/tag.json")));


        ResultActions resultOfCreation = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());

        String createdTag = resultOfCreation.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto = objectMapper.readValue(createdTag, GetTagDto.class);

        assertEquals("Test Tag", createdTagDto.name());
        assertEquals("Test", createdTagDto.description());
        assertEquals("f8dffe30-09ed-4794-abc7-98a930c7b938", createdTagDto.userId().toString());

        UpdateTagDto updateTagDto = new UpdateTagDto("Test Tag Updated", "Test Updated");
        String updateTagDtoAsString = objectMapper.writeValueAsString(updateTagDto);

        ResultActions resultOfUpdate = mockMvc.perform(put("/tags/update/" + createdTagDto.id())
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateTagDtoAsString)
        ).andExpect(status().isNoContent());

        // verify it was updated

        ResultActions resultOfGet = mockMvc.perform(get("/tags/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());


        GetTagDto updatedTagDto = objectMapper.readValue(resultOfGet.andReturn().getResponse().getContentAsString(), GetTagDto.class);
        assertEquals("Test Tag Updated", updatedTagDto.name());
        assertEquals("Test Updated", updatedTagDto.description());
        assertEquals("f8dffe30-09ed-4794-abc7-98a930c7b938", updatedTagDto.userId().toString());

        ResultActions resultOfDelete = mockMvc.perform(delete("/tags/delete/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Create and update tags with the same name")
    public void sameNameTag() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/tags/tag.json")));


        ResultActions resultOfCreation = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());

        String createdTag = resultOfCreation.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto = objectMapper.readValue(createdTag, GetTagDto.class);

        assertEquals("Test Tag", createdTagDto.name());
        assertEquals("Test", createdTagDto.description());
        assertEquals("f8dffe30-09ed-4794-abc7-98a930c7b938", createdTagDto.userId().toString());

        // try to create the tag with the same name:
        mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isBadRequest());

        UpdateTagDto updateTagDto = new UpdateTagDto("Test Tag Updated", "Test Updated");
        String updateTagDtoAsString = objectMapper.writeValueAsString(updateTagDto);

        ResultActions resultOfUpdate = mockMvc.perform(put("/tags/update/" + createdTagDto.id())
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateTagDtoAsString)
        ).andExpect(status().isNoContent());

        // verify it was updated

        ResultActions resultOfGet = mockMvc.perform(get("/tags/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isOk());


        GetTagDto updatedTagDto = objectMapper.readValue(resultOfGet.andReturn().getResponse().getContentAsString(), GetTagDto.class);
        assertEquals("Test Tag Updated", updatedTagDto.name());
        assertEquals("Test Updated", updatedTagDto.description());
        assertEquals("f8dffe30-09ed-4794-abc7-98a930c7b938", updatedTagDto.userId().toString());

        // create a second tag
        String secondTag = new String(Files.readAllBytes(Path.of("src/test/resources/tags/differentNameTag.json")));


        ResultActions resultOfCreation2 = mockMvc.perform(post("/tags/create")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(secondTag)
        ).andExpect(status().isOk());

        String createdTag2 = resultOfCreation2.andReturn().getResponse().getContentAsString();
        GetTagDto createdTagDto2 = objectMapper.readValue(createdTag2, GetTagDto.class);

        assertEquals("Test Tag - 2", createdTagDto2.name());
        assertEquals("Test", createdTagDto2.description());
        assertEquals("f8dffe30-09ed-4794-abc7-98a930c7b938", createdTagDto2.userId().toString());

        // update the second tag so that it has the same name as the first one
        String updatedTagAsString = objectMapper.writeValueAsString(updatedTagDto);
        mockMvc.perform(put("/tags/update/" + createdTagDto2.id())
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedTagAsString)
        ).andExpect(status().isBadRequest());

        ResultActions resultOfDelete = mockMvc.perform(delete("/tags/delete/" + createdTagDto.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());
        mockMvc.perform(delete("/tags/delete/" + createdTagDto2.id())
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(tagAsString)
        ).andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Fetch all tags for one user")
    public void allTagsForOneUser() throws Exception {
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of(
                        "coding.tamalito@gmail.com"),
                Optional.empty(),
                "123456"
        );

        String tagAsString = new String(Files.readAllBytes(Path.of("src/test/resources/tags/tag.json")));
        CreateTagDto createTagDto = objectMapper.readValue(tagAsString, CreateTagDto.class);
        List<CreateTagDto> createTagDtoList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            createTagDtoList.add(new CreateTagDto(createTagDto.name() + String.valueOf(i), createTagDto.description()));
        }

        for (CreateTagDto createTagDto1 : createTagDtoList) {
            String tagAsString1 = objectMapper.writeValueAsString(createTagDto1);
            mockMvc.perform(post("/tags/create")
                    .header("Authorization",bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(tagAsString1)
            ).andExpect(status().isOk());
        }

        // fetch all of them
        ResultActions resultActions = mockMvc.perform(get("/tags/user")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk());

        String response = resultActions.andReturn().getResponse().getContentAsString();
        List<GetTagDto> tagDtoList = objectMapper.readValue(response, objectMapper.getTypeFactory().constructCollectionType(List.class, GetTagDto.class));

        assertEquals(10, tagDtoList.size());

        for (GetTagDto fetchedTagDto : tagDtoList) {
            mockMvc.perform(delete("/tags/delete/" + fetchedTagDto.id())
                    .header("Authorization", bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(tagAsString)
            ).andExpect(status().isNoContent());
        }


        // verify there are none for the user
        ResultActions noTagsActions = mockMvc.perform(get("/tags/user")
                .header("Authorization",bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk());

        String responseNoTags = noTagsActions.andReturn().getResponse().getContentAsString();
        List<GetTagDto> responseNoTagsList = objectMapper.readValue(responseNoTags, objectMapper.getTypeFactory().constructCollectionType(List.class, GetTagDto.class));
        assertEquals(0, responseNoTagsList.size());
    }
}
