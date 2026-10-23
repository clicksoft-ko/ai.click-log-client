import { ClassNameProps } from "@/shared/types/props";
import { cn } from "@/shared/utils";
import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps extends ClassNameProps {
  copyText: string;
  /** 화면 낭독기·툴팁용 이름 */
  label?: string;
  /** 아이콘 옆에 보일 글자 (없으면 아이콘만) */
  text?: string;
  iconSize?: number;
}

export const CopyButton = ({
  className,
  copyText,
  label = "복사",
  text,
  iconSize = 16,
}: CopyButtonProps) => {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const flash = (next: "copied" | "failed") => {
    setStatus(next);
    setTimeout(() => setStatus("idle"), 1200);
  };

  return (
    <button
      aria-label={text ? undefined : label}
      title={status === "failed" ? "복사하지 못했습니다" : label}
      onClick={(e) => {
        e.stopPropagation();
        // 보안 출처(HTTPS)가 아니면 clipboard 가 없고, 권한이 없으면 실패한다
        if (!navigator.clipboard) {
          flash("failed");
          return;
        }
        navigator.clipboard
          .writeText(copyText)
          .then(() => flash("copied"))
          .catch(() => flash("failed"));
      }}
      className={cn(
        `absolute right-2 top-2 inline-flex items-center gap-1.5 rounded bg-gray-700 p-2 text-sm text-white hover:bg-gray-600`,
        className,
      )}
    >
      {status === "copied" ? (
        <Check size={iconSize} />
      ) : status === "failed" ? (
        <X size={iconSize} />
      ) : (
        <Copy size={iconSize} />
      )}
      {text && (
        <span>
          {status === "copied"
            ? "복사됨"
            : status === "failed"
              ? "복사 실패"
              : text}
        </span>
      )}
    </button>
  );
};
