import { cn } from "@/shared/utils";
import { TablePagination, useReactTableEx } from "@/widgets/table-pagination";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ErrorLog } from "../models/types";
import {
  buildHospitalGroups,
  formatLogTime,
  GroupSort,
  HospitalGroup,
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

const GRID =
  "grid grid-cols-[240px_84px_84px_84px_minmax(0,1fr)_130px_24px] gap-4";
const columns: ColumnDef<HospitalGroup, unknown>[] = [];

interface HospitalGroupListProps {
  /** 검색어까지 걸러진 최신순 로그 */
  logs: ErrorLog[];
  hospitalName: HospitalNameFn;
  onSelectLog: (log: ErrorLog) => void;
}

export const HospitalGroupList = ({
  logs,
  hospitalName,
  onSelectLog,
}: HospitalGroupListProps) => {
  const [sort, setSort] = useState<GroupSort>("count");
  const [multiComputerOnly, setMultiComputerOnly] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const groups = useMemo(
    () => buildHospitalGroups(logs, hospitalName, sort, multiComputerOnly),
    [logs, hospitalName, sort, multiComputerOnly],
  );

  const table = useReactTableEx({
    data: groups,
    columns,
    manualFiltering: true,
  });

  return (
    <>
      <p className="text-sm text-slate-600">
        병원마다 어떤 오류가 몇 대의 컴퓨터에서 났는지 봅니다.
      </p>
      <GroupOptions
        sort={sort}
        onSortChange={setSort}
        filterLabel="컴퓨터 여러 대에서 난 오류만"
        filterChecked={multiComputerOnly}
        onFilterChange={setMultiComputerOnly}
      />
      <div className="overflow-x-auto border border-slate-200 bg-white">
        <div className="min-w-[1100px]">
          <div
            className={cn(
              GRID,
              "bg-slate-200 px-5 py-3 text-sm font-medium text-gray-500",
            )}
          >
            <span>병원명</span>
            <span>발생</span>
            <span>오류 종류</span>
            <span>컴퓨터</span>
            <span>가장 많은 오류</span>
            <span>최근 발생</span>
            <span />
          </div>
          {table.getRowModel().rows.map(({ original: hospital }) => {
            const open = openKey === hospital.ykiho;
            const top = hospital.errors[0];
            return (
              <div
                key={hospital.ykiho}
                className={cn(
                  "border-t border-slate-200",
                  open && "bg-slate-50",
                )}
              >
                <button
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : hospital.ykiho)}
                  className={cn(
                    GRID,
                    "min-h-[60px] w-full items-center px-5 py-2.5 text-left hover:bg-slate-100",
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold">
                      {hospital.name || hospital.ykiho}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {hospital.ykiho}
                    </span>
                  </span>
                  <span className="text-xl">
                    <CountText value={hospital.count} unit="건" />
                  </span>
                  <CountText value={hospital.errors.length} unit="종" />
                  <CountText value={hospital.computerCount} unit="대" />
                  <span className="flex min-w-0 items-center gap-2.5">
                    <LevelBadge level={top.level} />
                    <ExceptionName
                      exceptionType={top.exceptionType}
                      className="shrink-0"
                    />
                    <span className="truncate text-sm text-slate-700">
                      {top.message}
                    </span>
                  </span>
                  <span className="font-mono text-[13px]">
                    {formatLogTime(hospital.latest.createdAt)}
                  </span>
                  <ExpandChevron open={open} />
                </button>

                {open && (
                  <div className="flex flex-col gap-2 px-5 pb-5 pt-1">
                    {hospital.errors.map((error) => (
                      <div
                        key={error.key}
                        className="grid grid-cols-[100px_minmax(0,1fr)_70px_150px_110px] items-start gap-4 rounded-lg border border-slate-200 bg-white px-3.5 py-3"
                      >
                        <span>
                          <LevelBadge level={error.level} />
                        </span>
                        <div className="flex min-w-0 flex-col gap-2">
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <ExceptionName
                              exceptionType={error.exceptionType}
                            />
                            <span className="truncate text-sm text-slate-700">
                              {error.message}
                            </span>
                          </div>
                          <ComputerChips
                            computers={error.computers}
                            onSelectLog={onSelectLog}
                          />
                        </div>
                        <span className="text-lg">
                          <CountText value={error.count} unit="건" />
                        </span>
                        <span className="truncate font-mono text-[13px] text-slate-800">
                          {error.moduleName}
                        </span>
                        <span className="font-mono text-[13px] text-slate-600">
                          {formatLogTime(error.latest.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
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
