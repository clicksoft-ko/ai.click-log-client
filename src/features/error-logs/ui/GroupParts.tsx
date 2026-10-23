import { cn } from "@/shared/utils";
import { ChevronRight } from "lucide-react";
import { ErrorLog } from "../models/types";
import { ComputerCount, GroupSort } from "../utils/error-log-groups";
import { levelBadgeClass } from "../utils/level-badge";

export const LevelBadge = ({ level }: { level: string }) => (
  <span
    className={cn(
      "inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold tracking-wide",
      levelBadgeClass(level),
    )}
  >
    {level}
  </span>
);

/** "System.NullReferenceException" → 네임스페이스는 작게, 타입 이름은 크게 */
export const ExceptionName = ({
  exceptionType,
  className,
}: {
  exceptionType: string;
  className?: string;
}) => {
  const dot = exceptionType.lastIndexOf(".");
  return (
    <span className={cn("truncate font-mono", className)}>
      <span className="text-xs text-slate-500">
        {exceptionType.slice(0, dot + 1)}
      </span>
      <span className="text-[15px] font-medium text-slate-900">
        {exceptionType.slice(dot + 1)}
      </span>
    </span>
  );
};

export const CountText = ({ value, unit }: { value: number; unit: string }) => (
  <span className="font-bold text-slate-900">
    {value}
    <span className="ml-0.5 text-xs font-medium text-slate-600">{unit}</span>
  </span>
);

export const ExpandChevron = ({ open }: { open: boolean }) => (
  <ChevronRight
    size={20}
    aria-hidden
    className={cn("text-slate-600 transition-transform", open && "rotate-90")}
  />
);

export const ComputerChips = ({
  computers,
  onSelectLog,
}: {
  computers: ComputerCount[];
  onSelectLog: (log: ErrorLog) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {computers.map((computer) => (
      <button
        key={computer.name}
        onClick={() => onSelectLog(computer.latest)}
        title="이 컴퓨터의 가장 최근 로그 보기"
        className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 text-[13px] text-slate-800 hover:border-slate-500 hover:bg-slate-50"
      >
        {computer.name}
        {computer.count > 1 && (
          <b className="text-xs text-slate-600">×{computer.count}</b>
        )}
      </button>
    ))}
  </div>
);

const SORT_OPTIONS: { value: GroupSort; label: string }[] = [
  { value: "count", label: "건수순" },
  { value: "recent", label: "최근 발생순" },
];

export const GroupOptions = ({
  sort,
  onSortChange,
  filterLabel,
  filterChecked,
  onFilterChange,
}: {
  sort: GroupSort;
  onSortChange: (sort: GroupSort) => void;
  filterLabel: string;
  filterChecked: boolean;
  onFilterChange: (checked: boolean) => void;
}) => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
    <div className="flex gap-1 rounded-md bg-slate-200 p-1">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          aria-pressed={sort === option.value}
          onClick={() => onSortChange(option.value)}
          className={cn(
            "h-8 rounded px-3 text-sm font-medium text-slate-600",
            sort === option.value && "bg-white text-slate-900 shadow-sm",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={filterChecked}
        onChange={(e) => onFilterChange(e.target.checked)}
        className="h-4 w-4 accent-slate-900"
      />
      {filterLabel}
    </label>
  </div>
);
