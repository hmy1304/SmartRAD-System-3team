-- V17: 시스템 관리자 등 관리자의 기본 소속 부서를 '원장실'에서 '관리팀'으로 수정
UPDATE department SET name = '관리팀', updated_at = NOW() WHERE name = '원장실' OR id = 1;
