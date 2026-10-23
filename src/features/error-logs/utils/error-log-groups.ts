import { compareDesc, format } from "date-fns";
import { ErrorLog, ErrorLogRow } from "../models/types";

export type HospitalNameFn = (ykiho: string) => string;
export type GroupSort = "count" | "recent";

export interface ComputerCount {
  name: string;
  count: number;
  /** 이 컴퓨터에서 난 가장 최근 로그 (칩을 누르면 상세로 연다) */
  latest: ErrorLog;
}

export interface HospitalBreakdown {
  ykiho: string;
  name: string;
  count: number;
  computers: ComputerCount[];
  latest: ErrorLog;
}

export interface ErrorGroup {
  key: string;
  level: string;
  exceptionType: string;
  /** IP·긴 숫자를 가린 메시지 */
  message: string;
  moduleName: string;
  /** 최신순 */
  logs: ErrorLog[];
  count: number;
  hospitals: HospitalBreakdown[];
  computerCount: number;
  versions: string[];
  latest: ErrorLog;
  oldest: ErrorLog;
}

export interface HospitalErrorGroup {
  key: string;
  level: string;
  exceptionType: string;
  message: string;
  moduleName: string;
  count: number;
  computers: ComputerCount[];
  latest: ErrorLog;
}

export interface HospitalGroup {
  ykiho: string;
  name: string;
  count: number;
  computerCount: number;
  /** 건수 많은 순 */
  errors: HospitalErrorGroup[];
  latest: ErrorLog;
}

const LEVEL_RANK: Record<string, number> = {
  FATAL: 5,
  CRITICAL: 4,
  ERROR: 3,
  WARN: 2,
  WARNING: 2,
  INFO: 1,
};

const levelRank = (level: string) => LEVEL_RANK[level.toUpperCase()] ?? 0;

/** 메시지 속 IP·긴 숫자는 같은 값으로 본다 (접속 주소·ID 만 다른 같은 오류를 한 묶음으로) */
export const normalizeMessage = (message: string) =>
  message
    .replace(/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?/g, "{IP}")
    .replace(/\d{4,}/g, "{N}");

/** 모듈 · 예외 타입 · 메시지가 같으면 같은 오류 */
export const errorKey = (log: ErrorLog) =>
  `${log.moduleName}|${log.exceptionType}|${normalizeMessage(log.errorMessage)}`;

/** 전체 로그 표의 전역 검색과 같은 칸을 같은 방식으로 비교한다 (tableFilterFn 참고) */
export const matchesSearch = (
  log: ErrorLog,
  hospitalName: HospitalNameFn,
  text: string,
) => {
  if (!text) return true;
  const query = text.toLowerCase();
  const fields = [
    log.createdAt != null ? format(log.createdAt, "yy-MM-dd HH:mm:ss") : null,
    log.ykiho != null ? `${hospitalName(log.ykiho)} (${log.ykiho})` : null,
    log.computerName,
    log.moduleName,
    log.logLevel,
    log.exceptionType,
    log.errorMessage,
    log.clientVersion,
  ];
  return fields.some(
    (value) => value != null && String(value).toLowerCase().includes(query),
  );
};

/** 같은 컴퓨터에서 연달아 난 같은 오류(메시지까지 동일)를 한 줄로 접는다. logs 는 최신순이어야 한다 */
export const collapseConsecutive = (logs: ErrorLog[]): ErrorLogRow[] => {
  const rows: ErrorLogRow[] = [];
  let prevKey: string | null = null;
  for (const log of logs) {
    const key = [
      log.ykiho,
      log.computerName,
      log.moduleName,
      log.exceptionType,
      log.errorMessage,
    ].join("|");
    const prev = rows[rows.length - 1];
    if (prev && key === prevKey) {
      prev.repeatCount = (prev.repeatCount ?? 1) + 1;
      continue;
    }
    rows.push({ ...log, repeatCount: 1 });
    prevKey = key;
  }
  return rows;
};

function groupBy<T>(items: T[], keyOf: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

const topLevel = (logs: ErrorLog[]) =>
  logs.reduce(
    (top, log) =>
      levelRank(log.logLevel) > levelRank(top) ? log.logLevel : top,
    logs[0].logLevel,
  );

/** logs 는 최신순이어야 한다 */
const countComputers = (logs: ErrorLog[]): ComputerCount[] =>
  Array.from(
    groupBy(logs, (log) => log.computerName),
    ([name, rows]) => ({
      name,
      count: rows.length,
      latest: rows[0],
    }),
  ).sort((a, b) => b.count - a.count);

const byCount = (
  a: { count: number; latest: ErrorLog },
  b: { count: number; latest: ErrorLog },
) => b.count - a.count || compareDesc(a.latest.createdAt, b.latest.createdAt);

const byRecent = (a: { latest: ErrorLog }, b: { latest: ErrorLog }) =>
  compareDesc(a.latest.createdAt, b.latest.createdAt);

const sorter = (sort: GroupSort) => (sort === "count" ? byCount : byRecent);

/** logs 는 최신순이어야 한다 */
export const buildErrorGroups = (
  logs: ErrorLog[],
  hospitalName: HospitalNameFn,
  sort: GroupSort,
): ErrorGroup[] =>
  Array.from(groupBy(logs, errorKey), ([key, rows]) => {
    const hospitals = Array.from(
      groupBy(rows, (log) => log.ykiho),
      ([ykiho, hospitalRows]) => ({
        ykiho,
        name: hospitalName(ykiho),
        count: hospitalRows.length,
        computers: countComputers(hospitalRows),
        latest: hospitalRows[0],
      }),
    ).sort(byCount);

    return {
      key,
      level: topLevel(rows),
      exceptionType: rows[0].exceptionType,
      message: normalizeMessage(rows[0].errorMessage),
      moduleName: rows[0].moduleName,
      logs: rows,
      count: rows.length,
      hospitals,
      computerCount: hospitals.reduce((sum, h) => sum + h.computers.length, 0),
      versions: [...new Set(rows.map((log) => log.clientVersion))],
      latest: rows[0],
      oldest: rows[rows.length - 1],
    };
  }).sort(sorter(sort));

/**
 * logs 는 최신순이어야 한다.
 * multiComputerOnly 면 컴퓨터 2대 이상에서 난 오류만 남기고, 병원 합계도 남은 오류로 다시 센다.
 */
export const buildHospitalGroups = (
  logs: ErrorLog[],
  hospitalName: HospitalNameFn,
  sort: GroupSort,
  multiComputerOnly: boolean,
): HospitalGroup[] => {
  const groups: HospitalGroup[] = [];
  for (const [ykiho, hospitalRows] of groupBy(logs, (log) => log.ykiho)) {
    const errors = Array.from(
      groupBy(hospitalRows, errorKey),
      ([key, rows]) => ({
        key,
        level: topLevel(rows),
        exceptionType: rows[0].exceptionType,
        message: normalizeMessage(rows[0].errorMessage),
        moduleName: rows[0].moduleName,
        count: rows.length,
        computers: countComputers(rows),
        latest: rows[0],
      }),
    )
      .filter((error) => !multiComputerOnly || error.computers.length > 1)
      .sort(byCount);
    if (errors.length === 0) continue;

    const computerNames = new Set(
      errors.flatMap((error) => error.computers.map((c) => c.name)),
    );
    groups.push({
      ykiho,
      name: hospitalName(ykiho),
      count: errors.reduce((sum, error) => sum + error.count, 0),
      computerCount: computerNames.size,
      errors,
      latest: errors.reduce((a, b) => (byRecent(a, b) <= 0 ? a : b)).latest,
    });
  }
  return groups.sort(sorter(sort));
};

export const formatLogTime = (date: Date) => format(date, "MM-dd HH:mm:ss");
