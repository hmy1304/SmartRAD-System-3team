"use client";

import { useEffect, useState } from "react";
import styles from "./NoticeModal.module.scss";
import {
  createNotice,
  getAuthorIdFromStorage,
  NOTICE_TYPE_CODE_MAP,
} from "@/services/noticeService";

const TYPES = ["일반공지", "긴급공지", "행사 안내", "교육 안내", "보안공지"] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function NoticeCreateModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [typeLabel, setTypeLabel] = useState<(typeof TYPES)[number]>("일반공지");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setTypeLabel("일반공지");
    setContent("");
    setIsImportant(false);
    setExpirationDate("");
    setError("");
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim()) {
      setError("제목을 입력하세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력하세요.");
      return;
    }
    const authorId = getAuthorIdFromStorage();
    if (!authorId) {
      setError("로그인 정보(authorId)가 없습니다. 다시 로그인하세요.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createNotice({
        authorId,
        title: title.trim(),
        content: content.trim(),
        noticeTypeCode: NOTICE_TYPE_CODE_MAP[typeLabel] ?? "NOTICE_GENERAL",
        isImportant,
        expirationDate: expirationDate || null,
      });
      onCreated?.();
      onClose();
      alert("공지가 등록되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>공지사항 작성</h2>
            <p>전체 또는 특정 부서에 공지를 등록합니다.</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label>
                제목 <b className={styles.req}>필수</b>
              </label>
              <span className={styles.charCount}>{title.length} / 100자</span>
            </div>
            <input
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>
                공지 유형 <b className={styles.req}>필수</b>
              </label>
              <select
                value={typeLabel}
                onChange={(e) =>
                  setTypeLabel(e.target.value as (typeof TYPES)[number])
                }
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>공지 대상</label>
              <select defaultValue="all">
                <option value="all">전체 직원</option>
              </select>
            </div>
          </div>

          <div className={styles.typeChips}>
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.chip} ${typeLabel === t ? styles.active : ""}`}
                onClick={() => setTypeLabel(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label>
                내용 <b className={styles.req}>필수</b>
              </label>
              <span className={styles.charCount}>{content.length} / 3000자</span>
            </div>
            <textarea
              maxLength={3000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"내용을 입력하세요.\n공지사항 내용을 자세히 작성해주세요."}
            />
          </div>

          <div className={styles.rowBetween}>
            <div className={styles.importantBox}>
              <div>
                <strong>중요 공지로 설정</strong>
                <div style={{ fontSize: 11, opacity: 0.8 }}>상단에 고정 표시됩니다</div>
              </div>
              <button
                type="button"
                className={`${styles.switch} ${isImportant ? styles.on : ""}`}
                onClick={() => setIsImportant((v) => !v)}
                aria-label="중요 공지"
              />
            </div>
            <div className={styles.field} style={{ flex: 1, minWidth: 160 }}>
              <label>게시 만료일</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={submit}
            disabled={saving}
          >
            {saving ? "등록 중..." : "공지 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}