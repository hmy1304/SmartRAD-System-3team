package com.tphr.hr.system.controller;

import com.tphr.hr.system.dto.MenuCreateRequest;
import com.tphr.hr.system.dto.MenuResponse;
import com.tphr.hr.system.dto.MenuUpdateRequest;
import com.tphr.hr.system.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // POST /menus - 메뉴 등록
    @PostMapping
    public ResponseEntity<MenuResponse> createMenu(@Valid @RequestBody MenuCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createMenu(request));
    }

    // GET /menus - 전체 메뉴 목록 조회
    @GetMapping
    public ResponseEntity<List<MenuResponse>> getMenus() {
        return ResponseEntity.ok(menuService.getMenus());
    }

    // GET /menus/{id} - 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<MenuResponse> getMenu(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenu(id));
    }

    // PATCH /menus/{id} - 수정
    @PatchMapping("/{id}")
    public ResponseEntity<MenuResponse> updateMenu(@PathVariable Long id,
                                                    @RequestBody MenuUpdateRequest request) {
        return ResponseEntity.ok(menuService.updateMenu(id, request));
    }
}
