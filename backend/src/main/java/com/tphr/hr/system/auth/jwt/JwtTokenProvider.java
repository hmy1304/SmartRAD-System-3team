package com.tphr.hr.system.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import com.tphr.hr.system.auth.security.RoleMapper;
import com.tphr.hr.system.auth.security.CustomUserDetailsService;
import com.tphr.hr.system.auth.security.CustomUserDetails;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private final CustomUserDetailsService customUserDetailsService;

    public JwtTokenProvider(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Value("${jwt.expiration}")
    private long tokenValidityInMilliseconds;

    private Key key;

    @PostConstruct
    public void init() {
        if (secretKey == null || secretKey.getBytes().length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes (256 bits) for HS256.");
        }
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // 토큰 생성
    public String createToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim("auth", authorities)
                .signWith(key, SignatureAlgorithm.HS256)
                .setExpiration(validity)
                .compact();
    }

    // 토큰을 받아 인증(Authentication) 객체 반환
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object authClaim = claims.get("auth");
        String authString = (authClaim != null) ? authClaim.toString() : "";

        // 클레임에는 createToken 이 담은 "ROLE_ADMIN" 같은 값이 들어있다.
        // mapToRole 을 다시 태우면 switch default 로 떨어져 전원 ROLE_USER 가 되므로
        // ROLE_ 접두어를 그대로 통과시키는 fromClaim 을 써야 한다.
        List<GrantedAuthority> authorities =
                Arrays.stream(authString.split(","))
                        .filter(auth -> !auth.isBlank())
                        .map(RoleMapper::fromClaim)
                        .distinct()
                        .map(auth -> (GrantedAuthority) new SimpleGrantedAuthority(auth))
                        .collect(Collectors.toList());

        // auth 클레임이 없는 비정상 토큰은 최소 권한만 부여한다.
        if (authorities.isEmpty()) {
            authorities = List.of(new SimpleGrantedAuthority(RoleMapper.ROLE_USER));
        }

        CustomUserDetails principal = (CustomUserDetails) customUserDetailsService.loadUserByUsername(claims.getSubject());

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}
