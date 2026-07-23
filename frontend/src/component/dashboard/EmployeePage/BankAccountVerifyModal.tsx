"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BankAccountVerifyModal.module.scss";

type Props = {
  open: boolean;
  bankName: string;
  accountNo: string;
  onClose: () => void;
  onVerified: () => void;
  onChangeAccount?: () => void;
};

const CODE_LENGTH = 3;
const TIMER_SECONDS = 180; // 3분

export default function BankAccountVerifyModal({
  open,
  bankName,
  accountNo,
  onClose,
  onVerified,
  onChangeAccount,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(2); // 이미지 기준: 1원 송금 단계
  const [code, setCode] = useState(["", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!open) return;
    setStep(2);
    setCode(["", "", ""]);
    setSecondsLeft(TIMER_SECONDS);
    setError("");
    setSubmitting(false);
  }, [open]);

  // 타이머
  useEffect(() => {
    if (!open || step !== 2) return;
    if (secondsLeft <= 0) return;

    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => window.clearInterval(t);
  }, [open, step, secondsLeft]);

  const timeText = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  const onCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError("");

    // 다음 칸 포커스
    if (digit && index < CODE_LENGTH - 1) {
      const el = document.getElementById(`bank-code-${index + 1}`);
      el?.focus();
    }
  };

  const onResend = () => {
    setCode(["", "", ""]);
    setSecondsLeft(TIMER_SECONDS);
    setError("");
    // 실제 API: 1원 재송금 요청
    alert("인증번호가 재발송되었습니다.");
  };

  const onConfirm = async () => {
    const joined = code.join("");
    if (joined.length !== CODE_LENGTH) {
      setError("인증번호 3자리를 입력하세요.");
      return;
    }
    if (secondsLeft <= 0) {
      setError("인증 시간이 만료되었습니다. 재발송 후 다시 시도하세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // TODO: 실제 계좌 인증 API 연동
      // await verifyBankAccount({ bankName, accountNo, code: joined });
      await new Promise((r) => setTimeout(r, 600));

      // 데모: 아무 3자리나 성공 처리 (원하면 특정 코드만 통과하게 변경)
      setStep(3);
      onVerified();
    } catch {
      setError("인증에 실패했습니다. 번호를 확인하세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="계좌 정보 인증"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🛡️</span>
            <div>
              <h2>계좌 정보 인증</h2>
              <p>1원 송금을 통해 계좌 소유자를 확인합니다</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {/* 단계 표시 */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}>
              <span>1</span>
              <p>계좌 입력</p>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}>
              <span>2</span>
              <p>1원 송금</p>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ""}`}>
              <span>3</span>
              <p>인증 완료</p>
            </div>
          </div>

          {/* 계좌 정보 카드 */}
          <div className={styles.accountCard}>
            <div className={styles.accountLeft}>
              <span className={styles.bankIcon}>🏦</span>
              <div>
                <strong>{bankName || "은행 미선택"}</strong>
                <p>{accountNo || "계좌번호 없음"}</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.changeBtn}
              onClick={() => {
                onChangeAccount?.();
                onClose();
              }}
            >
              ✎ 변경
            </button>
          </div>

          {/* 안내 */}
          <div className={styles.notice}>
            <strong>⚠ 1원 송금 안내</strong>
            <ul>
              <li>입력하신 계좌로 1원이 송금됩니다.</li>
              <li>송금 시 통장 메모란에 인증번호 3자리가 표시됩니다.</li>
              <li>인증번호는 발송 후 3분간 유효합니다.</li>
            </ul>
          </div>

          {/* 인증번호 입력 */}
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>
                통장 메모 인증번호 입력 <b>필수</b>
              </span>
              <span className={styles.timer}>⏱ {timeText}</span>
            </div>

            <div className={styles.codeRow}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`bank-code-${i}`}
                  className={styles.codeInput}
                  value={digit}
                  onChange={(e) => onCodeChange(i, e.target.value)}
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
              <button type="button" className={styles.resendBtn} onClick={onResend}>
                ↻ 재발송
              </button>
            </div>

            <p className={styles.hint}>
              통장 입금내역에서 ‘SmartRAD’ 뒤 3자리 숫자를 입력해 주세요.
            </p>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.secure}>🔒 금융 보안 표준 암호화 적용</span>
          <div className={styles.footerActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              × 취소
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={onConfirm}
              disabled={submitting}
            >
              {submitting ? "확인 중..." : "인증 확인"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}