import { cn } from "@/shared/utils";
import { CopyButton } from "@/widgets/buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/widgets/ui/dialog";
import { format as formatDate } from "date-fns";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { format } from "sql-formatter";
import { SlowQuery } from "../models/slow-query";
import {
  durationTier,
  formatSeconds,
  methodLabel,
} from "../utils/slow-query-groups";
import { StackFrames } from "./StackFrames";

interface SlowQueryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slowQuery: SlowQuery | null;
  hospitalName: (ykiho: string) => string;
}

export function SlowQueryDialog({
  isOpen,
  onOpenChange,
  slowQuery,
  hospitalName,
}: SlowQueryDialogProps) {
  const queryString = format(slowQuery?.queryString || "", {
    language: "mariadb",
  });
  const seconds = slowQuery?.executionSeconds ?? 0;
  const tier = durationTier(seconds);
  const method = slowQuery ? methodLabel(slowQuery) : "";

  const details = [
    {
      label: "병원",
      value: slowQuery ? hospitalName(slowQuery.ykiho) || slowQuery.ykiho : "",
    },
    { label: "컴퓨터", value: slowQuery?.computerName },
    {
      label: "발생시간",
      value: slowQuery
        ? formatDate(slowQuery.createdAt, "yyyy-MM-dd HH:mm:ss")
        : "",
    },
    { label: "버전", value: slowQuery?.ver, mono: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(1040px,94vw)] max-w-none flex-col gap-0 overflow-hidden p-0 text-[13px]">
        <header className="flex flex-col gap-3.5 border-b border-line py-5 pl-6 pr-14">
          <div className="flex items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-mono text-[12.5px] text-ink-3">
                {slowQuery?.assemblyName}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <DialogTitle className="truncate font-mono text-xl font-medium tracking-tight">
                  <span className="text-ink-2">{slowQuery?.className}.</span>
                  {slowQuery?.methodName}
                </DialogTitle>
                <CopyButton
                  copyText={method}
                  label={`${method} 복사`}
                  text="함수 이름 복사"
                  iconSize={13}
                  className="static shrink-0 rounded-md border border-line-strong bg-white px-2 py-1 text-xs text-ink hover:bg-ground"
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span
                className={cn(
                  "text-3xl font-semibold tabular-nums leading-none tracking-tight",
                  tier.text,
                )}
              >
                {formatSeconds(seconds)}
                <span className="ml-0.5 text-[15px] font-medium">초</span>
              </span>
              <span className="text-xs text-ink-3">실행시간</span>
            </div>
          </div>
          <DialogDescription className="sr-only">
            느린 쿼리의 위치, 쿼리 본문, 호출 경로입니다.
          </DialogDescription>
          <dl className="grid grid-cols-4 gap-3">
            {details.map(({ label, value, mono }) => (
              <div key={label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs text-ink-3">{label}</dt>
                <dd
                  className={cn(
                    "truncate font-semibold tabular-nums",
                    mono && "font-mono font-medium",
                  )}
                >
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px] overflow-hidden">
          <section className="flex min-h-0 min-w-0 flex-col gap-2 overflow-y-auto py-4 pl-6 pr-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">쿼리</h3>
              <CopyButton
                copyText={queryString}
                label="쿼리 복사"
                text="복사"
                iconSize={13}
                className="static rounded-md border border-line-strong bg-white px-2.5 py-1 text-[12.5px] text-ink hover:bg-ground"
              />
            </div>
            <SyntaxHighlighter
              language="sql"
              style={atomOneLight}
              customStyle={{
                margin: 0,
                padding: "14px 16px",
                border: "1px solid #DFE3EA",
                borderRadius: 8,
                background: "#F6F8FB",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              }}
            >
              {queryString}
            </SyntaxHighlighter>
            <p className="text-xs text-ink-3">
              여기 보이는 쿼리가 반드시 원인은 아닙니다. 같은 시점의 잠금·부하도
              함께 확인하세요.
            </p>
          </section>

          <aside className="flex min-h-0 flex-col gap-2 overflow-y-auto border-l border-line bg-[#FAFBFC] py-4 pl-5 pr-6">
            <h3 className="text-[13px] font-semibold">호출 경로</h3>
            <StackFrames slowQueryId={slowQuery?.id || 0} isOpen={isOpen} />
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-3">
          <span className="text-xs text-ink-3">Esc 키로 닫을 수 있습니다</span>
          <DialogClose className="h-9 rounded-md bg-ground px-4 text-[13px] font-semibold text-ink hover:bg-[#E4E8EF]">
            닫기
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
