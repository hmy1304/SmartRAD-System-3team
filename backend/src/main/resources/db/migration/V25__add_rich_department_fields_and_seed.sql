-- 1. 새로운 7대 속성 컬럼 추가 및 외래 키(부서장) 설정
ALTER TABLE department
ADD COLUMN dept_code VARCHAR(50) UNIQUE,
ADD COLUMN name_en VARCHAR(100),
ADD COLUMN manager_id BIGINT,
ADD COLUMN location VARCHAR(150),
ADD COLUMN phone VARCHAR(50),
ADD COLUMN established_date DATE,
ADD COLUMN description TEXT;

ALTER TABLE department
ADD CONSTRAINT fk_dept_manager
FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL;

-- 2. 기존 부서 이름 정규화 (원장실 -> 병원장)
UPDATE department SET name = '병원장' WHERE name = '원장실' OR name = '관리팀';

-- 3. 부족한 부문(Division) 데이터 신규 삽입
INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '진료부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '진료부문');

INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '간호부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '간호부문');

INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '행정지원부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '행정지원부문');

-- 약제부, 시설관리팀 누락 추가
INSERT INTO department (name, created_at, updated_at)
SELECT '약제부', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '약제부');

INSERT INTO department (name, created_at, updated_at)
SELECT '시설관리팀', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '시설관리팀');

INSERT INTO department (name, created_at, updated_at)
SELECT '감염관리실', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '감염관리실');

-- 4. 부서 계층(Tree) 연결 (Figma 명세 기준)
-- 진료부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '진료부문' LIMIT 1) AS t)
WHERE name IN ('영상의학과', '진단검사의학과', '응급의학과', '응급실', '약제부');

-- 간호부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '간호부문' LIMIT 1) AS t)
WHERE name IN ('간호부', '간호본부', '감염관리실', '중환자실');

-- 행정지원부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '행정지원부문' LIMIT 1) AS t)
WHERE name IN ('원무과', '인사총무팀', '시설관리팀');

-- 5. 기본 상세 정보(Mockup) 및 임시 부서코드 업데이트
UPDATE department SET dept_code = CONCAT('DEPT-', LPAD(id, 4, '0')) WHERE dept_code IS NULL;

-- 영상의학과 특수 데이터 주입 (피그마 상세 디자인 맵핑용)
UPDATE department 
SET 
    dept_code = 'DEPT-1002',
    name_en = 'Radiology',
    manager_id = (SELECT id FROM employee WHERE name = '박시준' LIMIT 1),
    location = '본관 3층',
    phone = '02-1234-3300',
    established_date = '2008-04-01',
    description = 'X-ray, CT, MRI 등 영상 진단 및 판독 업무를 담당하며, 응급의학과·진료부문 산하 검사 협진을 지원합니다.'
WHERE name = '영상의학과';

-- 간호부 상세
UPDATE department 
SET 
    name_en = 'Nursing Department',
    manager_id = (SELECT id FROM employee WHERE name = '이다영' LIMIT 1),
    location = '신관 2층',
    phone = '02-1234-4400',
    established_date = '2010-01-01',
    description = '입원 및 외래 환자 간호, 3교대 듀티 배정 및 환자 안위 관리 전담.'
WHERE name = '간호부';

-- 인사총무팀 상세
UPDATE department 
SET 
    name_en = 'HR & General Affairs',
    manager_id = (SELECT id FROM employee WHERE name = '시스템관리자' LIMIT 1),
    location = '행정동 5층',
    phone = '02-1234-5500',
    established_date = '2015-05-15',
    description = '전사 인사 관리, 채용, 급여 정산 및 시설 총무를 관할합니다.'
WHERE name = '인사총무팀';
