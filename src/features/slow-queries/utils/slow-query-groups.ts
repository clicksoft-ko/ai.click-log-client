import { compareDesc, format } from "date-fns";
import { groupBy } from "@/shared/utilities";
import { SlowQuery } from "../models/slow-query";

export type HospitalNameFn = (ykiho: string) => string;
export type LocationSort = "count" | "slowest" | "recent";

/**
 * 실행시간 단계. 최근 7일 4,095건 분포(수집 하한 15초, 중앙값 25초, 상위 10% 93초,
 * 상위 5% 152초)를 보고 30·60·120초로 끊었다 → 대략 60% / 23% / 10% / 7%
 */
export const DURATION_TIERS = [
  {
    min: 120,
    label: "120초 이상",
    bar: "bg-crit",
    text: "font-semibold text-crit",
  },
  {
    min: 60,
    label: "60–120초",
    bar: "bg-[#C2410C]",
    text: "font-semibold text-[#C2410C]",
  },
  { min: 30, label: "30–60초", bar: "bg-[#B7791F]", text: "text-[#8A5A00]" },
  { min: 0, label: "30초 미만", bar: "bg-[#7A869C]", text: "text-ink-2" },
] as const;

export const durationTier = (seconds: number) =>
  DURATION_TIERS.find((tier) => seconds >= tier.min) ??
  DURATION_TIERS[DURATION_TIERS.length - 1];

/** 막대 10칸이 채워지는 기준(초). 분포가 한쪽에 몰려 있어 간격을 점점 넓혔다 */
const METER_STEPS = [15, 20, 30, 45, 60, 90, 120, 180, 300, 600];
export const METER_SIZE = METER_STEPS.length;

export const meterFill = (seconds: number) =>
  Math.max(1, METER_STEPS.filter((step) => seconds >= step).length);

export const formatSeconds = (seconds: number) =>
  seconds >= 100 ? `${Math.round(seconds)}` : seconds.toFixed(1);

export const formatQueryTime = (date: Date) => format(date, "MM-dd HH:mm:ss");

/** 우리 프로그램 함수 이름 (클래스.메서드) */
export const methodLabel = (
  query: Pick<SlowQuery, "className" | "methodName">,
) => `${query.className}.${query.methodName}`;

export const locationKey = (query: SlowQuery) =>
  `${query.assemblyName}|${query.className}|${query.methodName}`;

/** 전체 쿼리 표의 칸과 같은 값을 검색한다. "클래스.메서드"로 붙여 넣어도 찾는다 */
export const matchesSlowQuerySearch = (
  query: SlowQuery,
  hospitalName: HospitalNameFn,
  text: string,
) => {
  if (!text) return true;
  const q = text.toLowerCase();
  const fields = [
    query.createdAt != null
      ? format(query.createdAt, "yy-MM-dd HH:mm:ss")
      : null,
    query.ykiho != null
      ? `${hospitalName(query.ykiho)} (${query.ykiho})`
      : null,
    query.computerName,
    query.assemblyName,
    `${query.assemblyName}.${methodLabel(query)}`,
    query.queryString,
    query.executionSeconds,
  ];
  return fields.some(
    (value) => value != null && String(value).toLowerCase().includes(q),
  );
};

export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** 요약 띠의 실행시간 통계. 한 번만 정렬하고, 큰 배열도 펼치지(...) 않는다 */
export const secondsSummary = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const mid = Math.floor(sorted.length / 2);
  return {
    median:
      sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
    p95: at(0.95),
    max: sorted[sorted.length - 1],
  };
};

const slowestOf = (queries: SlowQuery[]) =>
  queries.reduce((a, b) => (b.executionSeconds > a.executionSeconds ? b : a));

export interface ComputerSlowest {
  name: string;
  count: number;
  slowest: SlowQuery;
}

export interface LocationHospital {
  ykiho: string;
  name: string;
  count: number;
  computers: ComputerSlowest[];
  latest: SlowQuery;
}

export interface LocationGroup {
  key: string;
  assemblyName: string;
  className: string;
  methodName: string;
  /** 최신순 */
  queries: SlowQuery[];
  count: number;
  hospitals: LocationHospital[];
  computerCount: number;
  median: number;
  slowest: SlowQuery;
  latest: SlowQuery;
}

/** queries 는 최신순이어야 한다 */
export const buildLocationGroups = (
  queries: SlowQuery[],
  hospitalName: HospitalNameFn,
  sort: LocationSort,
): LocationGroup[] => {
  const groups = Array.from(groupBy(queries, locationKey), ([key, rows]) => {
    const hospitals = Array.from(
      groupBy(rows, (q) => q.ykiho),
      ([ykiho, hospitalRows]) => ({
        ykiho,
        name: hospitalName(ykiho),
        count: hospitalRows.length,
        computers: Array.from(
          groupBy(hospitalRows, (q) => q.computerName),
          ([name, computerRows]) => ({
            name,
            count: computerRows.length,
            slowest: slowestOf(computerRows),
          }),
        ).sort((a, b) => b.count - a.count),
        latest: hospitalRows[0],
      }),
    ).sort((a, b) => b.count - a.count);

    return {
      key,
      assemblyName: rows[0].assemblyName,
      className: rows[0].className,
      methodName: rows[0].methodName,
      queries: rows,
      count: rows.length,
      hospitals,
      computerCount: hospitals.reduce((sum, h) => sum + h.computers.length, 0),
      median: median(rows.map((q) => q.executionSeconds)),
      slowest: slowestOf(rows),
      latest: rows[0],
    };
  });

  const byRecent = (a: LocationGroup, b: LocationGroup) =>
    compareDesc(a.latest.createdAt, b.latest.createdAt);
  const comparators: Record<
    LocationSort,
    (a: LocationGroup, b: LocationGroup) => number
  > = {
    count: (a, b) => b.count - a.count || byRecent(a, b),
    slowest: (a, b) =>
      b.slowest.executionSeconds - a.slowest.executionSeconds || byRecent(a, b),
    recent: byRecent,
  };
  return groups.sort(comparators[sort]);
};
