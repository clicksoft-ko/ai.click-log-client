import { cn } from "@/shared/utils";
import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { frameLabel, StackFrame, StackLine } from "../utils/parse-stack-trace";

type StackRow =
  | (StackFrame & { isOrigin: boolean })
  | { kind: "text"; text: string }
  | { kind: "group"; firstNo: number; count: number };

const toRows = (lines: StackLine[], showFramework: boolean): StackRow[] => {
  const originNo = lines.find(
    (line): line is StackFrame => line.kind === "frame" && line.isApp,
  )?.no;
  const rows: StackRow[] = [];

  for (const line of lines) {
    if (line.kind === "text") {
      rows.push(line);
      continue;
    }
    if (!line.isApp && !showFramework) {
      // 연속된 프레임워크 프레임은 한 줄로 접는다
      const last = rows[rows.length - 1];
      if (last?.kind === "group") last.count += 1;
      else rows.push({ kind: "group", firstNo: line.no, count: 1 });
      continue;
    }
    rows.push({ ...line, isOrigin: line.no === originNo });
  }
  return rows;
};

/** 우리 코드 프레임만 골라 사용자 동작 → 오류 지점 순서로 보여준다 */
export const CallFlow = ({ lines }: { lines: StackLine[] }) => {
  const methods = lines
    .filter((line): line is StackFrame => line.kind === "frame" && line.isApp)
    .map(frameLabel)
    .reverse();

  if (methods.length === 0) return null;

  return (
    <section className="flex flex-col gap-2.5 border-b border-slate-200 px-7 py-4">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-bold text-slate-900">호출 흐름</h3>
        <span className="text-xs text-slate-500">
          우리 코드 기준 · 사용자 동작 → 오류 지점
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {methods.map((method, index) => {
          const isLast = index === methods.length - 1;
          return (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ArrowRight size={16} className="text-slate-500" aria-hidden />
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[13px] font-semibold",
                  isLast
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-blue-200 bg-blue-50 text-blue-900",
                )}
              >
                {method}
                {isLast && (
                  <span className="font-nanum-round text-[11px] font-bold">
                    발생
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

interface StackTraceViewProps {
  lines: StackLine[];
  rawText: string;
  /** 스택 조회 요청이 실패했는지 (스택이 없는 경우와 구분) */
  loadFailed: boolean;
}

export const StackTraceView = ({
  lines,
  rawText,
  loadFailed,
}: StackTraceViewProps) => {
  const [showFramework, setShowFramework] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(copyTimerRef.current), []);
  const rows = useMemo(
    () => toRows(lines, showFramework),
    [lines, showFramework],
  );

  const frames = lines.filter((line) => line.kind === "frame");
  const appCount = frames.filter((frame) => frame.isApp).length;
  const frameworkCount = frames.length - appCount;

  const handleCopy = async () => {
    try {
      // 비보안(HTTP) 환경에서는 navigator.clipboard 가 없다
      await navigator.clipboard.writeText(rawText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState("idle"), 1500);
  };

  const buttonClass =
    "inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50";

  return (
    <section className="flex flex-col gap-2.5 px-7 pb-2 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-slate-900">스택 트레이스</h3>
        {frames.length > 0 && (
          <span className="text-xs text-slate-500">
            전체 {frames.length}개 · 우리 코드 {appCount}개
          </span>
        )}
        <span className="flex-grow" />
        {frameworkCount > 0 && (
          <button
            className={buttonClass}
            onClick={() => setShowFramework((prev) => !prev)}
          >
            {showFramework
              ? "System 프레임 접기"
              : `System 프레임 ${frameworkCount}개 보기`}
          </button>
        )}
        {rawText && (
          <button className={buttonClass} onClick={handleCopy}>
            {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
            {copyState === "copied"
              ? "복사됨"
              : copyState === "failed"
                ? "복사 실패"
                : "스택 복사"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
        {frames.length === 0 ? (
          // 형식을 알 수 없는 스택은 원문 그대로 보여준다
          <pre className="whitespace-pre-wrap break-all p-2 font-mono text-[13px] text-slate-700">
            {rawText ||
              (loadFailed
                ? "스택 트레이스를 불러오지 못했습니다."
                : "스택 트레이스가 없습니다.")}
          </pre>
        ) : (
          rows.map((row, index) => {
            if (row.kind === "text") {
              return (
                <div
                  key={`text-${index}`}
                  className="px-3 py-1.5 font-mono text-xs text-slate-500"
                >
                  {row.text}
                </div>
              );
            }
            if (row.kind === "group") {
              return (
                <button
                  key={`group-${row.firstNo}`}
                  onClick={() => setShowFramework(true)}
                  className="flex min-h-10 items-center gap-2.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-left text-[13px] text-slate-600 hover:bg-slate-50"
                >
                  <ChevronDown size={16} aria-hidden />
                  <span>System 내부 호출 {row.count}개 숨김</span>
                  <span className="flex-grow" />
                  <span className="font-medium text-blue-700">펼치기</span>
                </button>
              );
            }
            return <FrameRow key={`frame-${row.no}`} frame={row} />;
          })
        )}
      </div>
    </section>
  );
};

const FrameRow = ({ frame }: { frame: StackFrame & { isOrigin: boolean } }) => {
  if (!frame.isApp) {
    return (
      <div className="flex items-start gap-3 px-3 py-1">
        <span className="w-6 shrink-0 text-right font-mono text-xs leading-5 text-slate-500">
          {frame.no}
        </span>
        <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] leading-5 text-slate-500">
          {frame.ns}
          <span className="text-slate-700">{frame.method}</span>
          {frame.args}
        </code>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2",
        frame.isOrigin
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white",
      )}
    >
      <span
        className={cn(
          "w-6 shrink-0 text-right font-mono text-xs leading-[22px]",
          frame.isOrigin ? "text-amber-800" : "text-slate-500",
        )}
      >
        {frame.no}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <code className="break-all font-mono text-[13.5px] leading-[22px]">
          <span className="text-slate-600">{frame.ns}</span>
          <span className="font-semibold text-blue-700">{frame.method}</span>
          <span className="text-slate-500">{frame.args}</span>
        </code>
        {frame.location && (
          <span className="break-all font-mono text-xs text-slate-500">
            {frame.location}
          </span>
        )}
      </div>
      {frame.isOrigin && (
        <span className="shrink-0 rounded-full bg-amber-700 px-2 py-0.5 text-[11px] font-bold text-white">
          발생 지점
        </span>
      )}
    </div>
  );
};
