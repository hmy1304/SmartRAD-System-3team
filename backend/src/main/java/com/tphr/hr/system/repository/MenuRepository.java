package com.tphr.hr.system.repository;

import com.tphr.hr.system.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    Optional<Menu> findByMenuCode(String menuCode);

    boolean existsByMenuCode(String menuCode);

    List<Menu> findAllByOrderByName();
}
