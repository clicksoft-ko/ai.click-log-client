import { compareDesc, format } from "date-fns";
import { groupBy } from "@/shared/utilities";
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

/**
 * 메시지 속 IP·긴 숫자는 같은 값으로 본다 (접속 주소·ID 만 다른 같은 오류를 한 묶음으로).
 * "Version=1.0.0.0" 은 버전이므로 IP 로 보지 않는다
 */
export const normalizeMessage = (message: string) =>
  message
    .replace(
      /(?<!Version=)(?<![\w.])\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?(?!\w|\.\d)/g,
      "{IP}",
    )
    .replace(/\d{4,}/g, "{N}");

// 메시지 정규화는 긴 메시지에서 비싸므로, 같은 로그 객체는 한 번만 계산한다
const errorKeyCache = new WeakMap<ErrorLog, string>();

/** 모듈 · 예외 타입 · 메시지가 같으면 같은 오류 */
export const errorKey = (log: ErrorLog) => {
  let key = errorKeyCache.get(log);
  if (key === undefined) {
    key = `${log.moduleName}|${log.exceptionType}|${normalizeMessage(log.errorMessage)}`;
    errorKeyCache.set(log, key);
  }
  return key;
};

/** 전체 로그 표에 보이는 칸을 표에 보이는 형식으로 비교한다 */
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

/**
 * 컴퓨터마다 자기 로그 흐름에서 연달아 난 같은 오류(레벨·메시지까지 동일)를 한 줄로 접는다.
 * 다른 병원·컴퓨터 로그가 사이에 끼어도 접히고, 접힌 행은 가장 최근 자리에 남는다.
 * logs 는 최신순이어야 한다
 */
export const collapseConsecutive = (logs: ErrorLog[]): ErrorLogRow[] => {
  const rows: ErrorLogRow[] = [];
  const lastByComputer = new Map<string, { key: string; row: ErrorLogRow }>();
  for (const log of logs) {
    const computer = `${log.ykiho}|${log.computerName}`;
    const key = `${log.logLevel}|${log.moduleName}|${log.exceptionType}|${log.errorMessage}`;
    const last = lastByComputer.get(computer);
    if (last && last.key === key) {
      last.row.repeatCount = (last.row.repeatCount ?? 1) + 1;
      last.row.members?.push(log);
      continue;
    }
    const row: ErrorLogRow = { ...log, repeatCount: 1, members: [log] };
    rows.push(row);
    lastByComputer.set(computer, { key, row });
  }
  return rows;
};

/**
 * 검색 중일 때: 접힌 로그 중 검색에 맞은 것만으로 대표 행(그중 가장 최근)과 건수를 다시 정한다.
 * 하나도 맞지 않는 행은 뺀다
 */
export const keepMatchedRows = (
  rows: ErrorLogRow[],
  matched: Set<ErrorLog>,
): ErrorLogRow[] => {
  let reordered = false;
  const kept = rows.flatMap((row) => {
    const members = row.members ?? [row];
    const hits = members.filter((member) => matched.has(member));
    if (hits.length === 0) return [];
    if (hits.length === members.length) return [row];
    reordered = true;
    return [{ ...hits[0], repeatCount: hits.length, members: hits }];
  });
  // 대표가 더 오래된 로그로 바뀐 행이 있으면 최신순을 다시 맞춘다 (안정 정렬)
  return reordered
    ? kept.sort((a, b) => compareDesc(a.createdAt, b.createdAt))
    : kept;
};

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
      versions: [...new Set(rows.map((log) => log.clientVersion))].filter(
        Boolean,
      ),
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
