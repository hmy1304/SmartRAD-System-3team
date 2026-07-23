import React from 'react';
import styles from './StatutoryGuideTab.module.scss';
import { 
  ShieldCheck, 
  Landmark, 
  Receipt, 
  FileText, 
  Download, 
  HelpCircle, 
  Phone, 
  Headphones, 
  MessageCircle 
} from 'lucide-react';

export default function StatutoryGuideTab() {
  return (
    <div className={styles.guideContainer}>
      {/* 하단 2단 레이아웃 영역 */}
      <div className={styles.bottomLayout}>
        
        {/* 왼쪽: 단계별 프로세스 가이드 */}
        <div className={styles.processSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <span className={styles.listIcon}>📋</span>
              <div>
                <h2>4대보험 신고 절차 (단계별 가이드)</h2>
                <p>신규 입사자 취득 신고 기준 · 사유 발생일로부터 14일 이내 신고 의무</p>
              </div>
            </div>
            <span className={styles.badgeProcess}>4단계 프로세스</span>
          </div>

          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>
                  <h3>사유 발생 확인</h3>
                  <span className={styles.badgeBlue}>D+0 이내</span>
                  <span className={styles.badgeGreenRight}>● 자동 감지</span>
                </div>
                <p>신규 입사, 퇴사, 보수 변경 등 신고 사유 발생 여부를 시스템에서 자동 감지합니다. 사유 발생 즉시 담당자에게 알림이 전송됩니다.</p>
                <div className={styles.stepBullets}>
                  <ul>
                    <li>취득: 신규 입사자 4대보험 가입 의무 발생</li>
                    <li>상실: 퇴사자 4대보험 자격 상실 신고 발생</li>
                  </ul>
                  <ul>
                    <li>보수변경: 월 보수 변경 시 공단 신고 필요</li>
                    <li>시스템 자동 알림 &rarr; 담당자 확인 &rarr; 신고 진행</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>
                  <h3>신고서 자동 작성</h3>
                  <span className={styles.badgeBlue}>사유 발생 후 14일 이내</span>
                  <span className={styles.badgeYellowRight}>● 수동 확인 필요</span>
                </div>
                <p>SmartRAD HR에서 취득·상실 정보를 기반으로 신고서를 자동 생성합니다. 내용 확인 후 EDI 파일을 다운로드합니다.</p>
                <div className={styles.checkRow}>
                  <span>✓ 신고서 자동 생성</span>
                  <span>✓ EDI 파일 자동 변환</span>
                  <span>✓ 취득·상실 신고서 포함</span>
                </div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>
                  <h3>EDI 파일 제출</h3>
                  <span className={styles.badgeBlue}>공단 포털 전자 제출</span>
                  <span className={styles.badgeYellowRight}>● 외부 포털 이동</span>
                </div>
                <p>4대보험 포털(www.4insure.or.kr) 또는 근로복지공단 EDI 시스템을 통해 전자 신고합니다.</p>
                <div className={styles.linkRow}>
                  <a href="#">&uarr; 4대보험 포털 : www.4insure.or.kr</a>
                  <a href="#">&uarr; 근로복지공단 고용·산재보험 토탈서비스 : total.kcomwel.or.kr</a>
                </div>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>
                  <h3>접수증 확인 및 보관</h3>
                  <span className={styles.badgeBlue}>완료 단계</span>
                  <span className={styles.badgeGreenRight}>● 5년 보관 의무</span>
                </div>
                <p>공단으로부터 접수증을 발급받아 SmartRAD HR에 저장합니다. 5년간 보관 의무가 있으며 시스템에서 자동 관리됩니다.</p>
                <div className={styles.checkRowGreen}>
                  <span>✓ SmartRAD HR 접수증 자동 보관 기능 이용 권장</span>
                  <span>✓ 법정 보관 기간: 신고일로부터 5년</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 사이드바 (서식, FAQ) */}
        <div className={styles.sideSection}>
          
          <div className={styles.sideCard}>
            <h3 className={styles.cardTitle}><FileText size={18} /> 주요 서식 자료</h3>
            <ul className={styles.downloadList}>
              <li>
                <div className={styles.docInfo}>
                  <FileText size={16} className={styles.docIcon} />
                  <div>
                    <strong>4대보험 취득신고서</strong>
                    <span>국민연금 · 건강보험 · 고용 · 산재</span>
                  </div>
                </div>
                <a href="/documents/form_4insure_acquire.hwp" download className={styles.downloadBtn}>다운로드</a>
              </li>
              <li>
                <div className={styles.docInfo}>
                  <FileText size={16} className={styles.docIcon} />
                  <div>
                    <strong>4대보험 상실신고서</strong>
                    <span>퇴사자 자격상실 신고용</span>
                  </div>
                </div>
                <a href="/documents/form_4insure_loss.hwp" download className={styles.downloadBtn}>다운로드</a>
              </li>
              <li>
                <div className={styles.docInfo}>
                  <FileText size={16} className={styles.docIconYellow} />
                  <div>
                    <strong>원천징수이행상황신고서</strong>
                    <span>매월 10일까지 제출</span>
                  </div>
                </div>
                <a href="/documents/form_withholding_tax.hwp" download className={`${styles.downloadBtn} ${styles.downloadBtnYellow}`}>다운로드</a>
              </li>
              <li>
                <div className={styles.docInfo}>
                  <FileText size={16} className={styles.docIconPurple} />
                  <div>
                    <strong>근로소득 지급명세서</strong>
                    <span>연말정산 후 3월 제출</span>
                  </div>
                </div>
                <a href="/documents/form_payment_statement.hwp" download className={`${styles.downloadBtn} ${styles.downloadBtnPurple}`}>다운로드</a>
              </li>
            </ul>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.cardTitle}><HelpCircle size={18} /> 자주 묻는 질문</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.question}><span className={styles.qMark}>Q</span> 취득신고 기한은 언제까지인가요?</div>
                <div className={styles.answer}><span className={styles.aMark}>A</span> 사유 발생일(입사일)로부터 14일 이내에 신고해야 합니다. 기한 초과 시 과태료가 부과될 수 있습니다.</div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.question}><span className={styles.qMark}>Q</span> EDI 파일은 어디서 제출하나요?</div>
                <div className={styles.answer}><span className={styles.aMark}>A</span> 4대보험 포털(www.4insure.or.kr)에서 EDI 파일을 업로드하거나 SmartRAD HR의 'EDI 파일 제출' 기능을 이용하세요.</div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.question}><span className={styles.qMark}>Q</span> 원천세 납부 기한을 놓쳤을 때는?</div>
                <div className={styles.answerRed}><span className={styles.aMarkRed}>A</span> 납부기한 다음 날부터 가산세(납부지연 가산세 0.025%/일)가 부과됩니다. 즉시 납부 후 수정신고를 진행하세요.</div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.question}><span className={styles.qMark}>Q</span> 연말정산 시 환급은 언제 받나요?</div>
                <div className={styles.answer}><span className={styles.aMark}>A</span> 2월분 급여 지급 시 환급액을 함께 지급합니다. 추가납부자는 2월분 급여에서 공제됩니다.</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
