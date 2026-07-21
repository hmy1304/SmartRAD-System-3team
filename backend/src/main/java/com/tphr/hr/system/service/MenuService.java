package com.tphr.hr.system.service;

import com.tphr.hr.system.dto.MenuCreateRequest;
import com.tphr.hr.system.dto.MenuResponse;
import com.tphr.hr.system.dto.MenuUpdateRequest;
import com.tphr.hr.system.entity.Menu;
import com.tphr.hr.system.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;

    // POST /menus - 메뉴 등록 (예: 듀티표 편성, 급여 처리 등 권한 부여 대상 화면 단위)
    @Transactional
    public MenuResponse createMenu(MenuCreateRequest request) {
        if (menuRepository.existsByMenuCode(request.menuCode())) {
            throw new IllegalArgumentException("이미 존재하는 메뉴 코드입니다: " + request.menuCode());
        }

        Menu menu = Menu.builder()
                .menuCode(request.menuCode())
                .name(request.name())
                .description(request.description())
                .build();

        return MenuResponse.from(menuRepository.save(menu));
    }

    // GET /menus - 전체 메뉴 목록 조회
    public List<MenuResponse> getMenus() {
        return menuRepository.findAllByOrderByName().stream()
                .map(MenuResponse::from)
                .toList();
    }

    // GET /menus/{id} - 단건 조회
    public MenuResponse getMenu(Long id) {
        return MenuResponse.from(getMenuEntity(id));
    }

    // PATCH /menus/{id} - 수정 (menuCode는 불변)
    @Transactional
    public MenuResponse updateMenu(Long id, MenuUpdateRequest request) {
        Menu menu = getMenuEntity(id);
        menu.update(request.name(), request.description());
        return MenuResponse.from(menu);
    }

    private Menu getMenuEntity(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("메뉴를 찾을 수 없습니다. id=" + id));
    }
}
