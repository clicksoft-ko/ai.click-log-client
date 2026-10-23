import { cn } from "@/shared/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { groupGridClass } from "../constants";

export const GroupHeader = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      groupGridClass,
      "border-b border-line bg-panel py-2 font-medium text-ink-2",
      className,
    )}
  >
    {children}
  </div>
);

export const CountText = ({
  value,
  unit,
  className,
}: {
  value: number;
  unit: string;
  className?: string;
}) => (
  <span className={cn("font-semibold tabular-nums", className)}>
    {value.toLocaleString()}
    <span className="ml-px text-[11.5px] font-normal text-ink-3">{unit}</span>
  </span>
);

export const ExpandChevron = ({ open }: { open: boolean }) => (
  <ChevronRight
    size={18}
    aria-hidden
    className={cn("text-ink-3 transition-transform", open && "rotate-90")}
  />
);

export interface ChipItem {
  key: string;
  label: string;
  count: number;
  onClick: () => void;
}

const CHIP_LIMIT = 8;

/** 컴퓨터 같은 이름 칩. 많으면 앞의 8개만 보이고 "외 n대"로 펼친다 */
export const ChipList = ({
  items,
  title,
  moreUnit = "대",
}: {
  items: ChipItem[];
  title?: string;
  moreUnit?: string;
}) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, CHIP_LIMIT);
  const hidden = items.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          title={title}
          className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-[5px] border border-line-strong bg-white px-2 text-xs text-ink hover:border-ink-2"
        >
          {item.label}
          {item.count > 1 && (
            <b className="text-[11px] font-semibold text-ink-3">
              ×{item.count}
            </b>
          )}
        </button>
      ))}
      {hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="inline-flex h-6 items-center px-1 text-xs text-ink-2 underline-offset-2 hover:text-ink hover:underline"
        >
          외 {hidden}
          {moreUnit}
        </button>
      )}
    </div>
  );
};

/** 펼친 묶음 안의 소제목 + 설명 */
export const DetailHeading = ({
  title,
  hint,
}: {
  title: string;
  hint?: React.ReactNode;
}) => (
  <div className="flex items-baseline justify-between gap-2 text-xs text-ink-2">
    <span className="font-semibold text-ink">{title}</span>
    {hint && <span className="truncate">{hint}</span>}
  </div>
);
