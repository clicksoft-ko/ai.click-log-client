import { cn } from "@/shared/utils";
import { Loading } from "@/widgets/loading";
import { CircleAlert, X } from "lucide-react";
import { useStackTrace } from "../hooks/use-stack-trace";
import { ErrorLog } from "../models/types";
import { parseStackTrace } from "../utils/parse-stack-trace";
import { CallFlow, StackTraceView } from "./StackTrace";
import { useEffect, useMemo } from "react";
import { format } from "date-fns/format";

interface ErrorLogDetailModalProps {
  log: ErrorLog;
  csNameMap: Map<string, string> | undefined;
  onClose: () => void;
}

const levelBadgeClass = (level: string) => {
  switch (level.toUpperCase()) {
    case "FATAL":
    case "ERROR":
      return "bg-red-100 text-red-800";
    case "WARN":
    case "WARNING":
      return "bg-amber-100 text-amber-800";
    case "INFO":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const ErrorLogDetailModal = ({
  log,
  csNameMap,
  onClose,
}: ErrorLogDetailModalProps) => {
  const { stackTrace, isPending, isError } = useStackTrace(log.id);
  const stackLines = useMemo(
    () => parseStackTrace(stackTrace ?? ""),
    [stackTrace],
  );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (isPending) {
    return <Loading />;
  }

  // "System.NullReferenceException" → 네임스페이스는 작게, 타입 이름은 크게
  const typeDot = log.exceptionType.lastIndexOf(".");
  const exceptionNs = log.exceptionType.slice(0, typeDot + 1);
  const exceptionName = log.exceptionType.slice(typeDot + 1);

  const details = [
    { label: "병원명", value: csNameMap?.get(log.ykiho) || "", sub: log.ykiho },
    { label: "컴퓨터명", value: log.computerName },
    { label: "모듈", value: log.moduleName, mono: true },
    { label: "버전", value: log.clientVersion, mono: true },
  ];

  return (
    <div
      className="fixed inset-0 top-0 z-10 flex items-center justify-center bg-black bg-opacity-50 duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="error-log-title"
        className="flex max-h-[90vh] w-[min(960px,92vw)] flex-col overflow-hidden rounded-xl bg-white shadow-xl duration-300 animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 본문 전체를 한 스크롤 영역으로 두어, 내용이 길어도 아래 닫기 버튼이 잘리지 않게 한다 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="flex flex-col gap-3.5 border-b border-slate-200 px-7 pb-5 pt-6">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
                  levelBadgeClass(log.logLevel),
                )}
              >
                <CircleAlert size={14} aria-hidden />
                {log.logLevel}
              </span>
              <span className="text-sm text-slate-600">
                {format(log.createdAt, "yy-MM-dd HH:mm:ss")}
              </span>
              <span className="flex-grow" />
              <button
                onClick={onClose}
                aria-label="닫기"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {exceptionNs && (
                <span className="font-mono text-[13px] text-slate-500">
                  {exceptionNs}
                </span>
              )}
              <h2
                id="error-log-title"
                className="break-all font-mono text-2xl font-semibold text-slate-900"
              >
                {exceptionName}
              </h2>
            </div>

            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base font-medium leading-relaxed text-red-900">
              {log.errorMessage}
            </div>

            <dl className="grid grid-cols-4 gap-3">
              {details.map(({ label, value, sub, mono }) => (
                <div key={label} className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd
                    className={cn(
                      "break-all text-[15px] font-bold text-slate-900",
                      mono && "font-mono",
                    )}
                  >
                    {value || "-"}
                    {sub && (
                      <span className="ml-1.5 font-mono text-xs font-normal text-slate-500">
                        {sub}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <CallFlow lines={stackLines} />
          <StackTraceView
            lines={stackLines}
            rawText={stackTrace ?? ""}
            loadFailed={isError}
          />
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 px-7 py-4">
          <button
            onClick={onClose}
            className="h-11 rounded-lg bg-slate-200 px-5 text-sm font-medium text-slate-900 hover:bg-slate-300"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
