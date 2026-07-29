package com.tphr.hr.payroll.service;

import com.tphr.hr.payroll.dto.*;
import com.tphr.hr.payroll.entity.*;
import com.tphr.hr.payroll.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayrollSettingsService {

    private final BaseSalaryRepository baseSalaryRepository;
    private final AllowanceItemRepository allowanceItemRepository;
    private final DeductionItemRepository deductionItemRepository;
    private final MinimumWageRepository minimumWageRepository;

    public PayrollSettingsSummaryDto getSummary() {
<<<<<<< HEAD
        return PayrollSettingsSummaryDto.builder()
                .baseSalaries(getBaseSalaries())
                .allowanceItems(getAllowanceItems())
                .deductionItems(getDeductionItems())
                .minimumWage(getMinimumWage())
=======
        List<BaseSalaryDto> baseSalaries = getBaseSalaries();
        List<AllowanceItemDto> allowanceItems = getAllowanceItems();
        List<DeductionItemDto> deductionItems = getDeductionItems();
        MinimumWageDto minimumWage = getMinimumWage();

        long averageBaseSalary = 0L;
        if (!baseSalaries.isEmpty()) {
            averageBaseSalary = baseSalaries.stream()
                    .mapToLong(b -> b.getActualAmount() != null ? b.getActualAmount().longValue() : 0L)
                    .sum() / baseSalaries.size();
        }

        int activeAllowanceCount = (int) allowanceItems.stream().filter(a -> Boolean.TRUE.equals(a.getIsActive())).count();
        int activeDeductionCount = (int) deductionItems.stream().filter(d -> Boolean.TRUE.equals(d.getIsActive())).count();

        // 2026년 7월로 현재 시뮬레이션 고정 (또는 LocalDateTime.now() 사용)
        String applicableMonth = "2026년 7월";

        return PayrollSettingsSummaryDto.builder()
                .baseSalaries(baseSalaries)
                .allowanceItems(allowanceItems)
                .deductionItems(deductionItems)
                .minimumWage(minimumWage)
                .averageBaseSalary(averageBaseSalary)
                .allowanceCount(activeAllowanceCount)
                .deductionCount(activeDeductionCount)
                .applicableMonth(applicableMonth)
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
                .build();
    }

    public List<BaseSalaryDto> getBaseSalaries() {
        return baseSalaryRepository.findAll().stream().map(b -> BaseSalaryDto.builder()
                .id(b.getId())
                .jobTitle(b.getJobTitle())
                .minAmount(b.getMinAmount())
                .maxAmount(b.getMaxAmount())
                .actualAmount(b.getActualAmount())
                .build()).collect(Collectors.toList());
    }

    public List<AllowanceItemDto> getAllowanceItems() {
        return allowanceItemRepository.findAll().stream().map(a -> AllowanceItemDto.builder()
                .id(a.getId())
                .name(a.getName())
                .taxType(a.getTaxType())
                .amountType(a.getAmountType())
                .amountOrRate(a.getAmountOrRate())
                .calculationBasis(a.getCalculationBasis())
<<<<<<< HEAD
=======
                .isActive(a.getIsActive())
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
                .build()).collect(Collectors.toList());
    }

    public List<DeductionItemDto> getDeductionItems() {
        return deductionItemRepository.findAll().stream().map(d -> DeductionItemDto.builder()
                .id(d.getId())
                .name(d.getName())
                .category(d.getCategory())
                .deductionType(d.getDeductionType())
                .rateOrAmount(d.getRateOrAmount())
<<<<<<< HEAD
=======
                .isActive(d.getIsActive())
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
                .build()).collect(Collectors.toList());
    }

    public MinimumWageDto getMinimumWage() {
        return minimumWageRepository.findAll().stream().findFirst().map(m -> MinimumWageDto.builder()
                .id(m.getId())
                .applyYear(m.getApplyYear())
                .hourlyWage(m.getHourlyWage())
                .monthlyWage(m.getMonthlyWage())
                .build()).orElse(null);
    }

    @Transactional
    public BaseSalaryDto updateBaseSalary(Long id, BaseSalaryDto dto) {
        BaseSalary entity = baseSalaryRepository.findById(id).orElseThrow(() -> new RuntimeException("BaseSalary not found"));
        entity.setMinAmount(dto.getMinAmount());
        entity.setMaxAmount(dto.getMaxAmount());
        entity.setActualAmount(dto.getActualAmount());
        return dto;
    }

    @Transactional
    public AllowanceItemDto createAllowanceItem(AllowanceItemDto dto) {
        AllowanceItem entity = AllowanceItem.builder()
                .name(dto.getName())
                .taxType(dto.getTaxType())
                .amountType(dto.getAmountType())
                .amountOrRate(dto.getAmountOrRate())
                .calculationBasis(dto.getCalculationBasis())
                .build();
        allowanceItemRepository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Transactional
    public AllowanceItemDto updateAllowanceItem(Long id, AllowanceItemDto dto) {
        AllowanceItem entity = allowanceItemRepository.findById(id).orElseThrow(() -> new RuntimeException("AllowanceItem not found"));
        entity.setName(dto.getName());
        entity.setTaxType(dto.getTaxType());
        entity.setAmountType(dto.getAmountType());
        entity.setAmountOrRate(dto.getAmountOrRate());
        entity.setCalculationBasis(dto.getCalculationBasis());
        return dto;
    }

    @Transactional
    public void deleteAllowanceItem(Long id) {
        allowanceItemRepository.deleteById(id);
    }

    @Transactional
    public DeductionItemDto createDeductionItem(DeductionItemDto dto) {
        DeductionItem entity = DeductionItem.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .deductionType(dto.getDeductionType())
                .rateOrAmount(dto.getRateOrAmount())
                .build();
        deductionItemRepository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Transactional
    public DeductionItemDto updateDeductionItem(Long id, DeductionItemDto dto) {
        DeductionItem entity = deductionItemRepository.findById(id).orElseThrow(() -> new RuntimeException("DeductionItem not found"));
        entity.setName(dto.getName());
        entity.setCategory(dto.getCategory());
        entity.setDeductionType(dto.getDeductionType());
        entity.setRateOrAmount(dto.getRateOrAmount());
        return dto;
    }

    @Transactional
    public void deleteDeductionItem(Long id) {
        deductionItemRepository.deleteById(id);
    }
<<<<<<< HEAD
=======

    @Transactional
    public void toggleAllowanceActive(Long id, Boolean isActive) {
        AllowanceItem entity = allowanceItemRepository.findById(id).orElseThrow(() -> new RuntimeException("AllowanceItem not found"));
        entity.setIsActive(isActive);
    }

    @Transactional
    public void toggleDeductionActive(Long id, Boolean isActive) {
        DeductionItem entity = deductionItemRepository.findById(id).orElseThrow(() -> new RuntimeException("DeductionItem not found"));
        entity.setIsActive(isActive);
    }
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
}
