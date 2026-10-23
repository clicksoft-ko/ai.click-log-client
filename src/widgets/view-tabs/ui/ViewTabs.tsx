import { cn } from "@/shared/utils";

export interface ViewTab<T extends string> {
  value: T;
  label: string;
  count?: number;
  /** 마우스를 올리면 보이는 설명 (예: 묶는 기준) */
  title?: string;
}

interface ViewTabsProps<T extends string> {
  tabs: ViewTab<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 오른쪽에 붙는 탭별 보조 옵션 */
  children?: React.ReactNode;
}

export const ViewTabs = <T extends string>({
  tabs,
  value,
  onChange,
  children,
}: ViewTabsProps<T>) => (
  <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-line">
    <div role="tablist" aria-label="보기 방식" className="flex gap-[22px]">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={selected}
            title={tab.title}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px inline-flex h-10 items-center gap-1.5 border-b-2 border-transparent px-0.5 text-sm text-ink-2 hover:text-ink",
              selected && "border-navy font-semibold text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs font-normal tabular-nums text-ink-3">
                {tab.count.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
    </div>
    {children && (
      <div className="flex min-h-10 flex-wrap items-center gap-x-3.5 gap-y-1 pb-1">
        {children}
      </div>
    )}
  </div>
);

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/** 정렬처럼 하나만 고르는 작은 버튼 묶음 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) => (
  <div
    role="group"
    aria-label={label}
    className="flex gap-0.5 rounded-[7px] bg-[#E4E8EF] p-0.5"
  >
    {options.map((option) => (
      <button
        key={option.value}
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
        className={cn(
          "h-[30px] rounded-[5px] px-3 text-[12.5px] text-ink-2 hover:text-ink",
          option.value === value &&
            "bg-white font-semibold text-ink shadow-[0_0_0_1px_#DFE3EA]",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const CheckOption = ({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) => (
  <label className="inline-flex cursor-pointer items-center gap-[7px] text-[13px] text-ink-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-[15px] w-[15px] accent-navy"
    />
    {children}
  </label>
);
