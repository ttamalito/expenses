package com.api.expenses.rest.configuration;

import com.api.expenses.rest.filters.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationConfiguration authenticationConfiguration;
    private final UserDetailsService userDetailsService;

    @Autowired
    public SecurityConfig(JwtFilter jwtFilter,
                          @Lazy PasswordEncoder passwordEncoder, // @Lazy to avoid circular dependency
                          AuthenticationConfiguration authenticationConfiguration,
                          UserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.passwordEncoder = passwordEncoder;
        this.authenticationConfiguration = authenticationConfiguration;
        //this.userDetailsService = userDetailsService;
        this.userDetailsService = userDetailsService;
    }

    // Reduced whitelist for simplicity
    private static final String[] WHITE_LIST_URL = {
            "/ping/not",
            "/auth/login",
            "/auth/signup",
            "/auth/ping",
            "/auth/ping/not",
            "/v3/api-docs",
    };

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable()) // Disable CSRF. to enable do Customizer.withDefaults()
                .authorizeHttpRequests((authorizeHttpRequests) -> {
                    authorizeHttpRequests.requestMatchers(WHITE_LIST_URL).permitAll() // do not apply to the whitelist
                            .anyRequest().authenticated(); // apply to all other requests
                })
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless session management
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        /*
        The jwtFilter will populate the UsernamePasswordAuthenticationToken with the user's if the token is valid.
        Then that token will be passed to the AuthenticationManager (the implementation of it).
        The usual implementation of the AuthenticationManager is the ProviderManager which delegates the authentication to the AuthenticationProvider.
        The AuthenticationProvider (there are some, like DaoAuthenticationProvider) will use the UserDetailsService to load the user's data and then it will compare the password.
        The userDetailsService has to return a UserDetails object with the user's data.
        That is the object that the AuthenticationProvider will use to compare the password.
        If the password is correct, the AuthenticationProvider will return an Authentication object with the user's data.
        That object will be passed to the SecurityContextHolder and the user will be authenticated.
         */

        return http.build();
    }

//    @Bean
//    CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.addAllowedOriginPattern("*");
//        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
//        configuration.setAllowedHeaders(Arrays.asList("Authorization", "authorization", "content-type", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers"));
//        configuration.setAllowCredentials(true);
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }

//    @Bean
//    UserDetailsService userDetailsService() {
//        return new UserDetailsServiceImpl();
//    }

    @Bean
    AuthenticationManager authenticationManager() {
        try {
            return authenticationConfiguration.getAuthenticationManager();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // Setting our custom user details service
        provider.setPasswordEncoder(passwordEncoder); // Setting the password encoder
        return provider;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
