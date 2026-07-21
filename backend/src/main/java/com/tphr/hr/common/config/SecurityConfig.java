package com.tphr.hr.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 개발/테스트 단계 임시 설정.
 *
 * spring-boot-starter-security 가 classpath에 있으면 Spring Boot가 기본적으로
 * 모든 요청에 로그인(HTTP Basic)을 강제하고, 재기동할 때마다 콘솔에 임시 비밀번호를
 * 새로 발급한다. 아직 로그인/인증 모듈이 붙기 전까지는 Postman 테스트가 번거로워지므로
 * 여기서는 모든 요청을 permitAll 처리하고 기본 로그인 화면/HTTP Basic을 끈다.
 *
 * ⚠️ 주의: 실제 로그인(JWT 등) 모듈이 준비되면 이 설정은 반드시 교체해야 한다.
 *          지금 상태로 배포하면 인증 없이 모든 API가 열려 있는 것과 같다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable());

        return http.build();
    }
}
