"use client";

import { useEffect, useState } from "react";
import styles from "./NoticeModal.module.scss";
import {
  NOTICE_TYPE_CODE_MAP,
  updateNotice,
  type NoticeResponse,
} from "@/services/noticeService";

const TYPES = ["일반공지", "긴급공지", "행사 안내", "교육 안내", "보안공지"] as const;

function codeToLabel(code: string, name?: string): (typeof TYPES)[number] {
  if (name?.includes("긴급") || code === "NOTICE_URGENT") return "긴급공지";
  return "일반공지";
}

type Props = {
  open: boolean;
  notice: NoticeResponse | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function NoticeEditModal({
  open,
  notice,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState("");
  const [typeLabel, setTypeLabel] = useState<(typeof TYPES)[number]>("일반공지");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !notice) return;
    setTitle(notice.title ?? "");
    setContent(notice.content ?? "");
    setTypeLabel(codeToLabel(notice.noticeTypeCode, notice.noticeTypeName));
    setIsImportant(!!notice.isImportant);
    setExpirationDate(notice.expirationDate ?? "");
    setError("");
  }, [open, notice]);

  if (!open || !notice) return null;

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateNotice(notice.id, {
        title: title.trim(),
        content: content.trim(),
        noticeTypeCode: NOTICE_TYPE_CODE_MAP[typeLabel] ?? "NOTICE_GENERAL",
        isImportant,
        expirationDate: expirationDate || null,
      });
      onUpdated?.();
      onClose();
      alert("수정되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>공지사항 수정</h2>
            <p>등록된 공지사항 내용을 수정합니다.</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label>
              제목 <b className={styles.req}>필수</b>
            </label>
            <input
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
            <label>
              내용 <b className={styles.req}>필수</b>
            </label>
            <textarea
              maxLength={3000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.rowBetween}>
            <div className={styles.importantBox}>
              <div>
                <strong>중요 공지로 설정</strong>
              </div>
              <button
                type="button"
                className={`${styles.switch} ${isImportant ? styles.on : ""}`}
                onClick={() => setIsImportant((v) => !v)}
              />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
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
            {saving ? "저장 중..." : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}