import { cn } from "@/shared/utils";
import {
  CountText,
  ExpandChevron,
  GroupHeader,
  groupGridClass,
} from "@/widgets/group-list";
import {
  TableCard,
  TablePagination,
  useReactTableEx,
} from "@/widgets/table-pagination";
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
import { ComputerChips, ExceptionName, LevelBadge } from "./GroupParts";

const COLUMNS = "grid-cols-[220px_76px_68px_68px_minmax(0,1fr)_112px_20px]";
const ERROR_COLUMNS = "grid-cols-[88px_minmax(0,1fr)_64px_136px_100px]";
const columns: ColumnDef<HospitalGroup, unknown>[] = [];

interface HospitalGroupListProps {
  /** 검색어까지 걸러진 최신순 로그 */
  logs: ErrorLog[];
  hospitalName: HospitalNameFn;
  sort: GroupSort;
  multiComputerOnly: boolean;
  onSelectLog: (log: ErrorLog) => void;
}

export const HospitalGroupList = ({
  logs,
  hospitalName,
  sort,
  multiComputerOnly,
  onSelectLog,
}: HospitalGroupListProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const groups = useMemo(
    () => buildHospitalGroups(logs, hospitalName, sort, multiComputerOnly),
    [logs, hospitalName, sort, multiComputerOnly],
  );

  const table = useReactTableEx({
    data: groups,
    columns,
  });

  return (
    <TableCard>
      <div className="overflow-x-auto">
        <div className="min-w-[1080px]">
          <GroupHeader className={COLUMNS}>
            <span>병원</span>
            <span>발생</span>
            <span>오류 종류</span>
            <span>컴퓨터</span>
            <span>가장 많은 오류</span>
            <span>최근 발생</span>
            <span />
          </GroupHeader>
          {table.getRowModel().rows.map(({ original: hospital }) => {
            const open = openKey === hospital.ykiho;
            const top = hospital.errors[0];
            return (
              <div
                key={hospital.ykiho}
                className={cn(
                  "border-b border-line-soft",
                  open && "bg-[#F8FAFC]",
                )}
              >
                <button
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : hospital.ykiho)}
                  className={cn(
                    groupGridClass,
                    COLUMNS,
                    "min-h-[50px] w-full py-[7px] text-left hover:bg-panel",
                  )}
                >
                  <span className="flex min-w-0 flex-col leading-snug">
                    <span className="truncate font-semibold">
                      {hospital.name || hospital.ykiho}
                    </span>
                    <span className="text-[11.5px] tabular-nums text-ink-3">
                      {hospital.ykiho}
                    </span>
                  </span>
                  <CountText
                    value={hospital.count}
                    unit="건"
                    className="text-[17px] tracking-tight"
                  />
                  <CountText value={hospital.errors.length} unit="종" />
                  <CountText value={hospital.computerCount} unit="대" />
                  <span className="flex min-w-0 items-center gap-2.5">
                    <LevelBadge level={top.level} />
                    <ExceptionName
                      exceptionType={top.exceptionType}
                      className="shrink-0"
                    />
                    <span className="truncate text-ink-2">{top.message}</span>
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatLogTime(hospital.latest.createdAt)}
                  </span>
                  <ExpandChevron open={open} />
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-0.5">
                    <div className="rounded-lg border border-line bg-white">
                      {hospital.errors.map((error) => (
                        <div
                          key={error.key}
                          className={cn(
                            groupGridClass,
                            ERROR_COLUMNS,
                            "items-start border-b border-line-soft px-3 py-2 last:border-b-0",
                          )}
                        >
                          <span>
                            <LevelBadge level={error.level} />
                          </span>
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <div className="flex min-w-0 flex-col gap-px">
                              <ExceptionName
                                exceptionType={error.exceptionType}
                              />
                              <span className="truncate text-ink-2">
                                {error.message}
                              </span>
                            </div>
                            <ComputerChips
                              computers={error.computers}
                              onSelectLog={onSelectLog}
                            />
                          </div>
                          <CountText value={error.count} unit="건" />
                          <span className="truncate font-mono text-xs text-ink-2">
                            {error.moduleName}
                          </span>
                          <span className="tabular-nums text-ink-2">
                            {formatLogTime(error.latest.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="py-10 text-center text-ink-3">
              조건에 맞는 오류가 없습니다.
            </div>
          )}
        </div>
      </div>
      <TablePagination table={table} />
    </TableCard>
  );
};
