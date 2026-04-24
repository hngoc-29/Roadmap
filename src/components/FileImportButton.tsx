// ============================================================
// COMPONENTS/FILE-IMPORT-BUTTON.TSX
// ============================================================
// Nút import file dùng chung — xử lý client-side (FileReader),
// không upload lên server → không bị giới hạn 4.5MB Vercel.

"use client";

import { useRef } from "react";
import { readFileClientSide } from "@/lib/import-export";

interface FileImportButtonProps {
  /** Loại file chấp nhận, e.g. ".txt,.md,.json" */
  accept?: string;
  /** Label hiển thị trên nút */
  label?: string;
  /** Callback khi đọc file xong */
  onImport: (text: string, filename: string) => void;
  /** Callback khi lỗi */
  onError?: (msg: string) => void;
  /** Thêm className tùy chỉnh */
  className?: string;
  /** Variant: "outline" (default) | "ghost" */
  variant?: "outline" | "ghost";
}

export default function FileImportButton({
  accept = ".txt,.md,.json",
  label = "Import file",
  onImport,
  onError,
  className = "",
  variant = "outline",
}: FileImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileClientSide(file, onImport, onError);
    // Reset để có thể import lại cùng file
    e.target.value = "";
  };

  const base =
    "inline-flex items-center gap-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer";
  const styles = {
    outline:
      "px-3 py-1.5 border border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground",
    ghost:
      "px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground",
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${base} ${styles[variant]} ${className}`}
        title={`Import từ file (${accept})`}
      >
        📂 {label}
      </button>
    </>
  );
}
