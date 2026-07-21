package com.tphr.hr.employee.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 매일 자정 이후 실행되어, applyDate가 도래했지만 아직 Employee에 반영되지 않은
 * 발령 건을 찾아 부서/직급/호봉을 실제로 반영한다.
 * (POST /appointments, /appointments/batch 로 등록 시 applyDate가 미래인 경우를 위한 배치)
 */
@Component
@RequiredArgsConstructor
public class AppointmentScheduler {

    private final AppointmentService appointmentService;

    @Scheduled(cron = "0 5 0 * * *") // 매일 00:05
    public void applyDueAppointments() {
        appointmentService.applyDueAppointments();
    }
}
