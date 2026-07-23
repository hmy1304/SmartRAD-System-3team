"use client";

import { useEffect, useRef } from "react";
import styles from "./AddressSearchModal.module.scss";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          addressType: string;
          roadAddress: string;
          jibunAddress: string;
          buildingName?: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        embed: (el: HTMLElement) => void;
      };
    };
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (payload: { zipCode: string; address: string }) => void;
};

export default function AddressSearchModal({ open, onClose, onSelect }: Props) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !layerRef.current) return;

    // 다음 우편번호가 로드될 때까지 짧게 대기
    const timer = window.setInterval(() => {
      if (!window.daum?.Postcode || !layerRef.current) return;
      window.clearInterval(timer);

      layerRef.current.innerHTML = "";
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address =
            data.addressType === "R"
              ? data.roadAddress
              : data.jibunAddress;

          const full =
            data.buildingName && data.buildingName.length > 0
              ? `${address} (${data.buildingName})`
              : address;

          onSelect({
            zipCode: data.zonecode,
            address: full,
          });
          onClose();
        },
        width: "100%",
        height: "100%",
      }).embed(layerRef.current);
    }, 100);

    return () => window.clearInterval(timer);
  }, [open, onClose, onSelect]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="주소 검색"
      >
        <div className={styles.header}>
          <div>
            <h2>주소 검색</h2>
            <p>도로명 또는 지번 주소를 검색하세요</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div ref={layerRef} className={styles.postcodeLayer} />
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            × 취소
          </button>
        </div>
      </div>
    </div>
  );
}