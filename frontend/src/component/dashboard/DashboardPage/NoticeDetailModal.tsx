"use client";

import { useEffect, useState } from "react";
import styles from "./NoticeModal.module.scss";
import {
  deleteNotice,
  getNotice,
  type NoticeResponse,
} from "@/services/noticeService";

export type NoticeDetailFallback = {
  id: number;
  title: string;
  content?: string;
  dateText?: string;
  authorName?: string;
  noticeTypeName?: string;
};

type Props = {
  open: boolean;
  noticeId: number | null;
  /** mock 등 API에 없는 공지일 때 */
  fallback?: NoticeDetailFallback | null;
  onClose: () => void;
  onEdit: (notice: NoticeResponse) => void;
  onDeleted?: () => void;
  canManage?: boolean;
};

export default function NoticeDetailModal({
  open,
  noticeId,
  fallback,
  canManage = false,
  onClose,
  onEdit,
  onDeleted,
}: Props) {
  const [data, setData] = useState<NoticeResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocalOnly, setIsLocalOnly] = useState(false);

  useEffect(() => {
    if (!open || noticeId == null) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      setData(null);
      setIsLocalOnly(false);

      try {
        const res = await getNotice(noticeId);
        if (!cancelled) {
          setData(res);
        }
      } catch {
        // API 실패 → fallback(mock)으로 표시
        if (!cancelled && fallback && fallback.id === noticeId) {
          setIsLocalOnly(true);
          setData({
            id: fallback.id,
            title: fallback.title,
            content:
              fallback.content ??
              "등록된 상세 본문이 없습니다. (로컬 미리보기)",
            noticeTypeCode: "NOTICE_GENERAL",
            noticeTypeName: fallback.noticeTypeName ?? "일반공지",
            isImportant: false,
            authorId: 0,
            authorName: fallback.authorName ?? "관리자",
            viewCount: 0,
            expirationDate: null,
            createdAt: fallback.dateText ?? "",
            updatedAt: fallback.dateText ?? "",
          });
        } else if (!cancelled) {
          setError(
            "공지를 불러올 수 없습니다. 서버에 등록된 공지만 상세 조회됩니다.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, noticeId, fallback]);

  if (!open) return null;

  const urgent =
    data?.noticeTypeCode === "NOTICE_URGENT" ||
    data?.noticeTypeName?.includes("긴급");

  const onDelete = async () => {
    if (!data || isLocalOnly) {
      alert("로컬 미리보기 공지는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("이 공지를 삭제할까요?")) return;
    try {
      await deleteNotice(data.id);
      onDeleted?.();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>공지 상세보기</h2>
            <p>공지사항{isLocalOnly ? " (미리보기)" : ""}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {loading && <p className={styles.body}>불러오는 중…</p>}
        {error && !data && (
          <p className={styles.error} style={{ padding: 20 }}>
            {error}
          </p>
        )}

        {data && !loading && (
          <>
            <div className={styles.detailMeta} style={{ paddingTop: 16 }}>
              <span
                className={`${styles.typePill} ${
                  urgent ? styles.urgent : styles.normal
                }`}
              >
                {data.noticeTypeName || data.noticeTypeCode}
              </span>
              {data.isImportant && (
                <span className={styles.importantPill}>중요</span>
              )}
            </div>
            <h3 className={styles.detailTitle}>{data.title}</h3>
            <div className={styles.detailMeta}>
              <span>{data.authorName}</span>
              <span>
                {data.createdAt
                  ? String(data.createdAt).slice(0, 16).replace("T", " ")
                  : "-"}
              </span>
              {!isLocalOnly && <span>조회 {data.viewCount ?? 0}회</span>}
            </div>
            <div className={styles.detailBody}>{data.content}</div>
            <div className={styles.detailFooter}>
              <div className={styles.detailFooterLeft}>
                {canManage && !isLocalOnly && (
                  <>
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      onClick={onDelete}
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => data && onEdit?.(data)}
                    >
                      수정
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}