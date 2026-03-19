package com.diploma.spp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    String secret;

    @Value("${app.jwt.expiration}")
    Long expiration;

    public String generateToken(String email, String role){
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token){
        try{
            extractEmail(token);
            return true;
        } catch (Exception e){
            return false;
        }
    }
    private SecretKey getSigningKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secret);//Перевод secret обратно в байты из BASE64
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
