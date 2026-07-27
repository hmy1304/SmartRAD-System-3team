package com.tphr.hr.payroll.controller;

import com.tphr.hr.payroll.dto.*;
import com.tphr.hr.payroll.service.PayrollSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payroll-settings")
@RequiredArgsConstructor
public class PayrollSettingsController {

    private final PayrollSettingsService payrollSettingsService;

    @GetMapping("/summary")
    public ResponseEntity<PayrollSettingsSummaryDto> getSummary() {
        return ResponseEntity.ok(payrollSettingsService.getSummary());
    }

    @GetMapping("/base-salaries")
    public ResponseEntity<List<BaseSalaryDto>> getBaseSalaries() {
        return ResponseEntity.ok(payrollSettingsService.getBaseSalaries());
    }

    @GetMapping("/allowances")
    public ResponseEntity<List<AllowanceItemDto>> getAllowanceItems() {
        return ResponseEntity.ok(payrollSettingsService.getAllowanceItems());
    }

    @GetMapping("/deductions")
    public ResponseEntity<List<DeductionItemDto>> getDeductionItems() {
        return ResponseEntity.ok(payrollSettingsService.getDeductionItems());
    }

    @GetMapping("/minimum-wage")
    public ResponseEntity<MinimumWageDto> getMinimumWage() {
        MinimumWageDto mw = payrollSettingsService.getMinimumWage();
        if (mw == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mw);
    }

    @PutMapping("/base-salaries/{id}")
    public ResponseEntity<BaseSalaryDto> updateBaseSalary(@PathVariable Long id, @RequestBody BaseSalaryDto dto) {
        return ResponseEntity.ok(payrollSettingsService.updateBaseSalary(id, dto));
    }

    @PostMapping("/allowances")
    public ResponseEntity<AllowanceItemDto> createAllowance(@RequestBody AllowanceItemDto dto) {
        return ResponseEntity.ok(payrollSettingsService.createAllowanceItem(dto));
    }

    @PutMapping("/allowances/{id}")
    public ResponseEntity<AllowanceItemDto> updateAllowance(@PathVariable Long id, @RequestBody AllowanceItemDto dto) {
        return ResponseEntity.ok(payrollSettingsService.updateAllowanceItem(id, dto));
    }

    @DeleteMapping("/allowances/{id}")
    public ResponseEntity<Void> deleteAllowance(@PathVariable Long id) {
        payrollSettingsService.deleteAllowanceItem(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/deductions")
    public ResponseEntity<DeductionItemDto> createDeduction(@RequestBody DeductionItemDto dto) {
        return ResponseEntity.ok(payrollSettingsService.createDeductionItem(dto));
    }

    @PutMapping("/deductions/{id}")
    public ResponseEntity<DeductionItemDto> updateDeduction(@PathVariable Long id, @RequestBody DeductionItemDto dto) {
        return ResponseEntity.ok(payrollSettingsService.updateDeductionItem(id, dto));
    }

    @DeleteMapping("/deductions/{id}")
    public ResponseEntity<Void> deleteDeduction(@PathVariable Long id) {
        payrollSettingsService.deleteDeductionItem(id);
        return ResponseEntity.ok().build();
    }
}
