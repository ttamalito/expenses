package com.api.expenses.rest.filters;

import com.api.expenses.rest.models.User;
import com.api.expenses.rest.services.JwtService;
import com.api.expenses.rest.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.swing.text.html.Option;
import java.io.IOException;
import java.util.Optional;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final Logger LOG = LogManager.getLogger();
    private final JwtService jwtService;

    private final UserService userService;

    @Autowired // Inject the JwtService
    public JwtFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    /**
     * Validate the jwt token and set the user's data in the security context
     * @param request
     * @param response
     * @param filterChain
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        LOG.debug("Processing authentication for '{}'", request.getRequestURL());

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtService.validateToken(token)) {
                    Optional<User> user = userService.getUserById(jwtService.extractUserId(token));
                    if (!user.isEmpty()) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user.get(), user.get().getId(), null ); // no authories i.e., roles
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    } else {
                        LOG.debug("User sent a valid token but the user was not found in the database");
                        filterChain.doFilter(request, response);
                    }

                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
