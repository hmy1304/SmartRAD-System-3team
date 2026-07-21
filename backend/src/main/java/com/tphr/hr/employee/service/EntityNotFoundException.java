package com.tphr.hr.employee.service;

/**
 * employee 도메인에서 ID/코드로 엔티티를 조회했으나 존재하지 않을 때 사용하는 예외.
 * 전역 예외 핸들러(@ControllerAdvice)에서 404로 매핑하는 것을 전제로 한다.
 */
public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }
}
