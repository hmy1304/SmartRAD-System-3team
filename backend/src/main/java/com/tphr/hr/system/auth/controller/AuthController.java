package com.tphr.hr.system.auth.controller;

import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.system.auth.dto.LoginRequest;
import com.tphr.hr.system.auth.dto.LoginResponse;
import com.tphr.hr.system.auth.jwt.JwtTokenProvider;
import com.tphr.hr.system.auth.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.tphr.hr.system.service.RoleGroupService;
import java.util.Collections;
import java.util.List;
import com.tphr.hr.system.dto.RolePermissionResponse;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RoleGroupService roleGroupService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        // 1. LoginRequest의 사번(empNo)과 비밀번호(password)를 기반으로 Authentication 객체 생성
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginRequest.getEmpNo(), loginRequest.getPassword());

        // 2. 실제 검증 (사용자 비밀번호 체크 등)
        // authenticate 메서드가 실행될 때 CustomUserDetailsService의 loadUserByUsername 메서드가 실행됨
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        String jwt = jwtTokenProvider.createToken(authentication);

        // 4. 인증 객체에서 사용자 정보 추출
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee employee = userDetails.getEmployee();

        // 5. 부서/직급/권한그룹 이름 추출 (null 처리 포함)
        String departmentName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;
        String positionName = employee.getPosition() != null ? employee.getPosition().getName() : null;
        String roleGroupName = employee.getRoleGroup() != null ? employee.getRoleGroup().getName() : null;
        
        List<RolePermissionResponse> permissions = Collections.emptyList();
        if (employee.getRoleGroup() != null) {
            permissions = roleGroupService.getPermissions(employee.getRoleGroup().getId());
        }

        // 6. LoginResponse DTO 생성하여 반환
        LoginResponse response = LoginResponse.builder()
                .accessToken(jwt)
                .employeeId(employee.getId())
                .empNo(employee.getEmpNo())
                .name(employee.getName())
                .departmentName(departmentName)
                .positionName(positionName)
                .roleGroupName(roleGroupName)
                .permissions(permissions)
                .build();

        return ResponseEntity.ok(response);
    }
}
