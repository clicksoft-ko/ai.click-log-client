import { cn } from "@/shared/utils";
import { ChipList } from "@/widgets/group-list";
import { ErrorLog } from "../models/types";
import { ComputerCount } from "../utils/error-log-groups";
import { levelBadgeClass } from "../utils/level-badge";

export const LevelBadge = ({ level }: { level: string }) => (
  <span
    className={cn(
      "inline-flex h-5 items-center whitespace-nowrap rounded px-[7px] text-[11px] font-semibold tracking-[0.01em]",
      levelBadgeClass(level),
    )}
  >
    {level}
  </span>
);

/** "System.NullReferenceException" → 네임스페이스는 흐리게, 타입 이름은 진하게 */
export const ExceptionName = ({
  exceptionType,
  className,
}: {
  exceptionType: string;
  className?: string;
}) => {
  const dot = exceptionType.lastIndexOf(".");
  return (
    <span className={cn("truncate font-mono text-xs", className)}>
      <span className="text-ink-3">{exceptionType.slice(0, dot + 1)}</span>
      <span className="font-medium text-ink">
        {exceptionType.slice(dot + 1)}
      </span>
    </span>
  );
};

export const ComputerChips = ({
  computers,
  onSelectLog,
}: {
  computers: ComputerCount[];
  onSelectLog: (log: ErrorLog) => void;
}) => (
  <ChipList
    title="이 컴퓨터의 가장 최근 로그 보기"
    items={computers.map((computer) => ({
      key: computer.name,
      label: computer.name,
      count: computer.count,
      onClick: () => onSelectLog(computer.latest),
    }))}
  />
);
