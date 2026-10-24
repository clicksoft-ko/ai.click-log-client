import { cn } from "@/shared/utils";
import { Skeleton } from "@/widgets/loading";
import { format } from "date-fns";

export interface SummaryStat {
  label: string;
  value: string;
  unit?: string;
  valueClassName?: string;
}

export interface HourSeries {
  label: string;
  /** 막대·범례 색 (bg-*) */
  barClassName: string;
}

interface SummaryBandProps {
  label: string;
  stats: SummaryStat[];
  /** [시간 0~23][계열] 건수. 계열은 series 순서대로 위에서 아래로 쌓인다 */
  hours: number[][];
  series: HourSeries[];
  /** 이 시간부터는 아직 오지 않은 시간 (점선으로 표시) */
  futureFrom?: number;
  latestAt?: Date;
  /** 가장 많은 시간의 막대를 다른 색으로 (계열이 하나일 때) */
  peakBarClassName?: string;
  /** 조회 중이면 숫자·막대 자리에 빈 막대를 보인다 */
  isLoading?: boolean;
}

const BAR_HEIGHT = 56;
const AXIS_HOURS = [0, 6, 12, 18];
// 조회 중 막대 자리 (하루 흐름처럼 낮에 높게)
const SKELETON_BARS = Array.from(
  { length: 24 },
  (_, hour) => `${Math.round(18 + 52 * Math.sin((Math.PI * hour) / 23))}%`,
);

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** 막대 전체 높이를 계열별로 나누되, 0이 아닌 계열은 최소 1px 보이게 한다 */
const splitHeights = (values: number[], height: number) => {
  const total = sum(values);
  const heights = values.map((v) =>
    v > 0 ? Math.max(1, Math.floor((v / total) * height)) : 0,
  );
  const largest = values.indexOf(Math.max(...values));
  heights[largest] = Math.max(1, heights[largest] + height - sum(heights));
  return heights;
};

export const SummaryBand = ({
  label,
  stats,
  hours,
  series,
  futureFrom,
  latestAt,
  peakBarClassName,
  isLoading = false,
}: SummaryBandProps) => {
  const totals = hours.map(sum);
  const max = Math.max(...totals);
  const peakHour = max > 0 ? totals.indexOf(max) : -1;

  return (
    <section
      aria-label={`${label} 요약`}
      className="grid rounded-[10px] border border-line bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(84px,1fr))] items-center gap-2 border-b border-line px-[18px] py-3.5 lg:border-b-0 lg:border-r">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            {isLoading ? (
              <span className="flex h-[27.5px] items-center">
                <Skeleton className="h-5 w-12" />
              </span>
            ) : (
              <span
                className={cn(
                  "text-[22px] font-semibold tabular-nums leading-tight tracking-tight",
                  stat.valueClassName,
                )}
              >
                {stat.value}
                {stat.unit && (
                  <span className="ml-0.5 text-[13px] font-medium">
                    {stat.unit}
                  </span>
                )}
              </span>
            )}
            <span className="text-xs text-ink-3">{stat.label}</span>
          </div>
        ))}
      </div>

      <figure
        role="img"
        aria-label={
          isLoading
            ? "시간대별 발생 건수를 불러오는 중입니다."
            : peakHour < 0
              ? "시간대별 발생 건수가 없습니다."
              : `시간대별 발생 건수. 가장 많은 시간은 ${peakHour}시 ${max.toLocaleString()}건입니다.`
        }
        className="flex flex-col gap-1.5 px-[18px] py-3"
      >
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-ink-2">
          <span className="font-semibold text-ink">시간대별 발생</span>
          {series.length > 1 &&
            series.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-[5px]"
              >
                <span className={cn("h-2 w-2 rounded-sm", s.barClassName)} />
                {s.label}
              </span>
            ))}
          <span className="ml-auto flex flex-wrap gap-x-3.5">
            {peakHour >= 0 && (
              <span>
                가장 많은 시간{" "}
                <b className="tabular-nums text-ink">
                  {peakHour}시 {max.toLocaleString()}건
                </b>
              </span>
            )}
            {latestAt && (
              <span>
                마지막 수신{" "}
                <b className="font-medium tabular-nums text-ink">
                  {format(latestAt, "MM-dd HH:mm:ss")}
                </b>
              </span>
            )}
          </span>
        </div>
        <div
          aria-hidden
          className="grid h-14 grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-[3px] border-b border-line"
        >
          {isLoading &&
            SKELETON_BARS.map((height, hour) => (
              <Skeleton
                key={hour}
                className="rounded-b-none rounded-t-sm"
                height={height}
              />
            ))}
          {!isLoading &&
            hours.map((values, hour) => {
              // 아직 오지 않은 시간 (조회 뒤 날짜만 바꾼 경우에도 실제 막대는 그대로 둔다)
              const total = totals[hour];
              if (
                futureFrom !== undefined &&
                hour >= futureFrom &&
                total === 0
              ) {
                return (
                  <div
                    key={hour}
                    className="border-t border-dashed border-line-strong"
                  />
                );
              }
              if (total === 0) return <div key={hour} />;
              const height = Math.max(
                2,
                Math.round((total / max) * BAR_HEIGHT),
              );
              const breakdown =
                series.length > 1
                  ? ` (${series.map((s, i) => `${s.label} ${values[i]}`).join(", ")})`
                  : "";
              return (
                <div
                  key={hour}
                  title={`${hour}시 ${total.toLocaleString()}건${breakdown}`}
                  className="flex flex-col overflow-hidden rounded-t-sm"
                >
                  {splitHeights(values, height).map((h, i) =>
                    h > 0 ? (
                      <div
                        key={i}
                        style={{ height: h }}
                        className={
                          hour === peakHour && peakBarClassName
                            ? peakBarClassName
                            : series[i].barClassName
                        }
                      />
                    ) : null,
                  )}
                </div>
              );
            })}
        </div>
        <div
          aria-hidden
          className="grid grid-cols-4 text-[11px] tabular-nums text-ink-3"
        >
          {AXIS_HOURS.map((hour) => (
            <span key={hour}>{hour}시</span>
          ))}
        </div>
      </figure>
    </section>
  );
};
