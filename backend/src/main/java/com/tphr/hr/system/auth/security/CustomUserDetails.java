package com.tphr.hr.system.auth.security;

import com.tphr.hr.employee.entity.Employee;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Employee employee;

    public CustomUserDetails(Employee employee) {
        this.employee = employee;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 권한 그룹(RoleGroup)이 있는 경우 ROLE_접두어를 붙이거나 그대로 사용
        // 우선은 RoleGroup의 name 또는 ID를 기반으로 생성 (기본값 설정)
        String roleName = (employee.getRoleGroup() != null) 
                ? employee.getRoleGroup().getName() 
                : "일반직원";
        
        String role = RoleMapper.mapToRole(roleName);
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return employee.getPassword();
    }

    @Override
    public String getUsername() {
        // 인증의 주체(Subject)는 사번(empNo)으로 설정
        return employee.getEmpNo();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return "ACTIVE".equals(employee.getAccountStatus());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equals(employee.getAccountStatus());
    }
}
