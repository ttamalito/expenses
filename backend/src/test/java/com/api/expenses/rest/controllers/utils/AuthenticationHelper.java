package com.api.expenses.rest.controllers.utils;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Optional;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthenticationHelper {

    /**
     * Logs in a user and returns "Bearer jwtToken"
     * @param mockMvc
     * @param email
     * @param username
     * @param password
     * @return "Bearer jwt"
     * @throws Exception
     */
    public static String loginUser(MockMvc mockMvc, Optional<String> email, Optional<String> username, String password) throws Exception {

        String json = "{\"email\": \"" + email.orElse(null) + "\", \"password\": \"" + password + "\"}";

        ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/auth/login")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk());

        String jwtToken = result.andReturn().getResponse().getContentAsString().split(":")[1].replace("\"", "").replace("}", "");
        return "Bearer" + jwtToken;
    }
}
