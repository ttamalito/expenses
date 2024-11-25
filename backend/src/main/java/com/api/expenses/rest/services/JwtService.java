package com.api.expenses.rest.services;

import com.api.expenses.rest.models.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Service to handle the jwt token
 * For more details: see: <a href="https://github.com/jwtk/jjwt?tab=readme-ov-file#quickstart">jjwt reference</a>
 */
@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey; // read the value from application.properties

    @Value("${application.security.jwt.expiration}")
    private long expiration;

    public boolean validateToken(String token) {

        try {
            Jwt<?, ?> jwtToken =  Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parse(token);
        } catch (ExpiredJwtException e) {
            return false; // TODO: add custom return value
        } catch (Exception e) {
            return false; // TODO: add custom return value
        }
        return true; // TODO: add custom return value
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
//        claims.put("email", user.getEmail());
//        claims.put("roles", user.getAuthorities());
        return createToken(claims, user.getUsername());
    }

    /**
     * Create the jwt token
     * @param claims
     * @param username
     * @return jwt token as a string
     */
    private String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // sign it with the secret key
                .compact();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
