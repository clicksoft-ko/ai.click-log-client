import { cn } from "@/shared/utils";
import {
  DURATION_TIERS,
  durationTier,
  formatSeconds,
  METER_SIZE,
  meterFill,
} from "../utils/slow-query-groups";

/** 실행시간 숫자 + 10칸 막대. 색은 실행시간 단계 */
export const DurationMeter = ({ seconds }: { seconds: number }) => {
  const tier = durationTier(seconds);
  const fill = meterFill(seconds);
  return (
    <span className="flex items-center justify-end gap-2.5">
      <span aria-hidden className="flex gap-0.5">
        {Array.from({ length: METER_SIZE }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-[7px] rounded-[1.5px]",
              i < fill ? tier.bar : "bg-[#E4E8EF]",
            )}
          />
        ))}
      </span>
      <span className={cn("min-w-[52px] text-right tabular-nums", tier.text)}>
        {formatSeconds(seconds)}초
      </span>
    </span>
  );
};

/** 탭 오른쪽에 붙는 단계 범례 (짧은 것부터) */
export const DurationLegend = () => (
  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-2">
    {[...DURATION_TIERS].reverse().map((tier) => (
      <span key={tier.label} className="inline-flex items-center gap-[5px]">
        <span className={cn("h-3 w-[7px] rounded-[1.5px]", tier.bar)} />
        {tier.label}
      </span>
    ))}
  </span>
);
