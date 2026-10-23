import { cn } from "@/shared/utils";
import { TablePagination, useReactTableEx } from "@/widgets/table-pagination";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { ErrorLog } from "../models/types";
import {
  buildErrorGroups,
  ErrorGroup,
  formatLogTime,
  GroupSort,
  HospitalNameFn,
} from "../utils/error-log-groups";
import {
  ComputerChips,
  CountText,
  ExceptionName,
  ExpandChevron,
  GroupOptions,
  LevelBadge,
} from "./GroupParts";

const RECENT_LIMIT = 5;
const GRID =
  "grid grid-cols-[100px_minmax(0,1fr)_84px_72px_72px_150px_130px_24px] gap-4";
const columns: ColumnDef<ErrorGroup, unknown>[] = [];

interface ErrorGroupListProps {
  /** 검색어까지 걸러진 최신순 로그 */
  logs: ErrorLog[];
  hospitalName: HospitalNameFn;
  onSelectLog: (log: ErrorLog) => void;
}

export const ErrorGroupList = ({
  logs,
  hospitalName,
  onSelectLog,
}: ErrorGroupListProps) => {
  const [sort, setSort] = useState<GroupSort>("count");
  const [multiHospitalOnly, setMultiHospitalOnly] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const groups = useMemo(() => {
    const all = buildErrorGroups(logs, hospitalName, sort);
    return multiHospitalOnly
      ? all.filter((group) => group.hospitals.length > 1)
      : all;
  }, [logs, hospitalName, sort, multiHospitalOnly]);

  const table = useReactTableEx({
    data: groups,
    columns,
    manualFiltering: true,
  });

  return (
    <>
      <p className="text-sm text-slate-600">
        모듈 · 예외 타입 · 메시지가 같으면 한 묶음입니다. 메시지 속 IP·긴 숫자는
        같은 값으로 봅니다.
      </p>
      <GroupOptions
        sort={sort}
        onSortChange={setSort}
        filterLabel="여러 병원에서 난 오류만"
        filterChecked={multiHospitalOnly}
        onFilterChange={setMultiHospitalOnly}
      />
      <div className="overflow-x-auto border border-slate-200 bg-white">
        <div className="min-w-[1100px]">
          <div
            className={cn(
              GRID,
              "bg-slate-200 px-5 py-3 text-sm font-medium text-gray-500",
            )}
          >
            <span>레벨</span>
            <span>오류</span>
            <span>발생</span>
            <span>병원</span>
            <span>컴퓨터</span>
            <span>모듈</span>
            <span>최근 발생</span>
            <span />
          </div>
          {table.getRowModel().rows.map(({ original: group }) => {
            const open = openKey === group.key;
            return (
              <div
                key={group.key}
                className={cn(
                  "border-t border-slate-200",
                  open && "bg-slate-50",
                )}
              >
                <button
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : group.key)}
                  className={cn(
                    GRID,
                    "min-h-16 w-full items-center px-5 py-3 text-left hover:bg-slate-100",
                  )}
                >
                  <span>
                    <LevelBadge level={group.level} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <ExceptionName exceptionType={group.exceptionType} />
                    <span className="truncate text-sm text-slate-700">
                      {group.message}
                    </span>
                  </span>
                  <span className="text-xl">
                    <CountText value={group.count} unit="건" />
                  </span>
                  <CountText value={group.hospitals.length} unit="곳" />
                  <CountText value={group.computerCount} unit="대" />
                  <span className="truncate font-mono text-[13px] text-slate-800">
                    {group.moduleName}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-mono text-[13px]">
                      {formatLogTime(group.latest.createdAt)}
                    </span>
                    <span className="text-xs text-slate-600">
                      {group.count > 1
                        ? `${format(group.oldest.createdAt, "MM-dd HH:mm")} 부터`
                        : "1회"}
                    </span>
                  </span>
                  <ExpandChevron open={open} />
                </button>

                {open && (
                  <ErrorGroupDetail
                    group={group}
                    hospitalName={hospitalName}
                    onSelectLog={onSelectLog}
                  />
                )}
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="border-t border-slate-200 py-10 text-center text-sm text-slate-500">
              조건에 맞는 오류가 없습니다.
            </div>
          )}
        </div>
      </div>
      <TablePagination table={table} />
    </>
  );
};

const ErrorGroupDetail = ({
  group,
  hospitalName,
  onSelectLog,
}: {
  group: ErrorGroup;
  hospitalName: HospitalNameFn;
  onSelectLog: (log: ErrorLog) => void;
}) => {
  const recent = group.logs.slice(0, RECENT_LIMIT);
  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-7 pb-5 pl-[136px] pr-5 pt-1">
      <div className="flex flex-col gap-2.5">
        <div className="text-sm font-bold text-slate-700">
          병원 · 컴퓨터 분포
        </div>
        {group.hospitals.map((hospital) => (
          <div
            key={hospital.ykiho}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-3"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-bold">
                {hospital.name || hospital.ykiho}
              </span>
              <span className="font-mono text-xs text-slate-500">
                {hospital.ykiho}
              </span>
              <span className="text-sm text-slate-600">
                {hospital.count}건 · 컴퓨터 {hospital.computers.length}대
              </span>
              <span className="ml-auto font-mono text-xs text-slate-600">
                최근 {formatLogTime(hospital.latest.createdAt)}
              </span>
            </div>
            <ComputerChips
              computers={hospital.computers}
              onSelectLog={onSelectLog}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-slate-700">최근 발생</span>
          <span className="truncate text-xs text-slate-600">
            버전 {group.versions.join(", ")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {recent.map((log) => (
            <button
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="grid min-h-10 w-full grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2.5 border-b border-slate-100 px-3 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-mono text-[13px]">
                {formatLogTime(log.createdAt)}
              </span>
              <span className="truncate">
                {hospitalName(log.ykiho) || log.ykiho}
              </span>
              <span className="truncate text-slate-700">
                {log.computerName}
              </span>
            </button>
          ))}
          {group.count > RECENT_LIMIT && (
            <div className="px-3 py-2.5 text-xs text-slate-600">
              외 {group.count - RECENT_LIMIT}건 · 행을 누르면 상세 화면이
              열립니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
