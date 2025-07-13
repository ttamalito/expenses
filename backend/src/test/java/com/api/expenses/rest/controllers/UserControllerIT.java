package com.api.expenses.rest.controllers;

import com.api.expenses.rest.controllers.utils.AuthenticationHelper;
import com.api.expenses.rest.models.Role;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.models.dtos.GetUserDto;
import com.api.expenses.rest.models.dtos.UpdateUserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerIT {
    private final MockMvc mockMvc;

    @Autowired
    public UserControllerIT(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    @DisplayName("Create, Read, update and delete user")
    public void crudUser() throws Exception {
        String createUserDtoJson = new String (Files.readAllBytes(Path.of("src/test/resources/user/createUser/createUserDto.json")));
        String jwtToken = mockMvc.perform(MockMvcRequestBuilders.post("/auth/signup")
                        .contentType("application/json")
                        .content(createUserDtoJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString().split(":")[1].replace("\"", "").replace("}", "");

        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of("test@test.com"), Optional.empty(), "test");

        ResultActions result = mockMvc.perform(get("/user/test")
                .header("Authorization",bearerToken)
        ).andExpect(status().isOk());

        String user = result.andReturn().getResponse().getContentAsString();
        GetUserDto testUser = new ObjectMapper().readValue(user, GetUserDto.class);

        assertEquals("test", testUser.username());
        assertEquals("test@test.com", testUser.email());
        assertEquals(Role.USER, testUser.role());
        assertEquals(1, testUser.currencyId());
        UpdateUserDto updateUserDto = new UpdateUserDto("Testing", "Testing", 2);
        String updateUserDtoJson = new ObjectMapper().writeValueAsString(updateUserDto);

        mockMvc.perform(MockMvcRequestBuilders.post("/user/update/test")
                        .header("Authorization",bearerToken)
        .contentType("application/json")
                .content(updateUserDtoJson)).andExpect(status().isOk());

        ResultActions result2 = mockMvc.perform(get("/user/test")
                .header("Authorization",bearerToken)
        ).andExpect(status().isOk());

        String user2 = result2.andReturn().getResponse().getContentAsString();
        GetUserDto testUser2 = new ObjectMapper().readValue(user2, GetUserDto.class);

        assertEquals("test", testUser2.username());
        assertEquals("test@test.com", testUser2.email());
        assertEquals(Role.USER, testUser2.role());
        assertEquals(1, testUser2.currencyId()); // TODO: Currency cannot be updated yet, handle it later
        assertEquals("Testing", testUser2.firstName());
        assertEquals("Testing", testUser2.lastName());

        mockMvc.perform(MockMvcRequestBuilders.delete("/user/delete/test")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk());
    }
    @Test
    @DisplayName("Test getUserDataFromJwtToken endpoint")
    public void testGetUserDataFromJwtToken() throws Exception {
        // Create a test user
        String createUserDtoJson = new String(Files.readAllBytes(Path.of("src/test/resources/user/createUser/createUserDto.json")));
        mockMvc.perform(MockMvcRequestBuilders.post("/auth/signup")
                .contentType("application/json")
                .content(createUserDtoJson))
                .andExpect(status().isOk());

        // Login to get bearer token
        String bearerToken = AuthenticationHelper.loginUser(mockMvc, Optional.of("test@test.com"), Optional.empty(), "test");

        // Call the /data endpoint
        ResultActions result = mockMvc.perform(get("/user/data")
                .header("Authorization", bearerToken))
                .andExpect(status().isOk());

        // Parse the response
        String userDataJson = result.andReturn().getResponse().getContentAsString();
        GetUserDto userData = new ObjectMapper().readValue(userDataJson, GetUserDto.class);

        // Verify the response contains the expected user data
        assertEquals("test", userData.username());
        assertEquals("test@test.com", userData.email());
        assertEquals(Role.USER, userData.role());
        assertEquals(1, userData.currencyId());

        // Clean up - delete the test user
        mockMvc.perform(MockMvcRequestBuilders.delete("/user/delete/test")
                .header("Authorization", bearerToken))
                .andExpect(status().isOk());
    }
}
