import { cn } from "@/shared/utils";
import {
  CountText,
  DetailHeading,
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
import { ComputerChips, ExceptionName, LevelBadge } from "./GroupParts";

const RECENT_LIMIT = 5;
const HOSPITAL_LIMIT = 8;
const COLUMNS =
  "grid-cols-[88px_minmax(0,1fr)_76px_60px_60px_136px_112px_20px]";
const columns: ColumnDef<ErrorGroup, unknown>[] = [];

interface ErrorGroupListProps {
  /** 검색어까지 걸러진 최신순 로그 */
  logs: ErrorLog[];
  hospitalName: HospitalNameFn;
  sort: GroupSort;
  multiHospitalOnly: boolean;
  onSelectLog: (log: ErrorLog) => void;
}

export const ErrorGroupList = ({
  logs,
  hospitalName,
  sort,
  multiHospitalOnly,
  onSelectLog,
}: ErrorGroupListProps) => {
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
  });

  return (
    <TableCard>
      <div className="overflow-x-auto">
        <div className="min-w-[1080px]">
          <GroupHeader className={COLUMNS}>
            <span>레벨</span>
            <span>오류</span>
            <span>발생</span>
            <span>병원</span>
            <span>컴퓨터</span>
            <span>모듈</span>
            <span>최근 발생</span>
            <span />
          </GroupHeader>
          {table.getRowModel().rows.map(({ original: group }) => {
            const open = openKey === group.key;
            return (
              <div
                key={group.key}
                className={cn(
                  "border-b border-line-soft",
                  open && "bg-[#F8FAFC]",
                )}
              >
                <button
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : group.key)}
                  className={cn(
                    groupGridClass,
                    COLUMNS,
                    "min-h-[50px] w-full py-[7px] text-left hover:bg-panel",
                  )}
                >
                  <span>
                    <LevelBadge level={group.level} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-px">
                    <ExceptionName exceptionType={group.exceptionType} />
                    <span className="truncate text-ink-2">{group.message}</span>
                  </span>
                  <CountText
                    value={group.count}
                    unit="건"
                    className="text-[17px] tracking-tight"
                  />
                  <CountText value={group.hospitals.length} unit="곳" />
                  <CountText value={group.computerCount} unit="대" />
                  <span className="truncate font-mono text-xs text-ink-2">
                    {group.moduleName}
                  </span>
                  <span className="flex flex-col tabular-nums leading-snug">
                    <span className="font-medium">
                      {formatLogTime(group.latest.createdAt)}
                    </span>
                    <span className="text-[11.5px] text-ink-3">
                      {group.count > 1
                        ? `${format(group.oldest.createdAt, "MM-dd HH:mm")}부터`
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

const ErrorGroupDetail = ({
  group,
  hospitalName,
  onSelectLog,
}: {
  group: ErrorGroup;
  hospitalName: HospitalNameFn;
  onSelectLog: (log: ErrorLog) => void;
}) => {
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const hospitals = showAllHospitals
    ? group.hospitals
    : group.hospitals.slice(0, HOSPITAL_LIMIT);
  const hiddenHospitals = group.hospitals.length - hospitals.length;
  const recent = group.logs.slice(0, RECENT_LIMIT);

  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 pb-4 pl-[118px] pr-4 pt-0.5">
      <div className="flex flex-col gap-1.5">
        <DetailHeading
          title="병원별 분포"
          hint="컴퓨터를 누르면 그 컴퓨터의 최근 로그가 열립니다"
        />
        <div className="rounded-lg border border-line bg-white">
          {hospitals.map((hospital) => (
            <div
              key={hospital.ykiho}
              className="grid grid-cols-[170px_92px_minmax(0,1fr)] items-start gap-3 border-b border-line-soft px-3 py-2 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col leading-snug">
                <span className="truncate font-semibold">
                  {hospital.name || hospital.ykiho}
                </span>
                <span className="text-[11.5px] tabular-nums text-ink-3">
                  최근 {formatLogTime(hospital.latest.createdAt)}
                </span>
              </div>
              <div className="tabular-nums leading-snug">
                <b className="font-semibold">{hospital.count}</b>건
                <br />
                <span className="text-[11.5px] text-ink-3">
                  컴퓨터 {hospital.computers.length}대
                </span>
              </div>
              <ComputerChips
                computers={hospital.computers}
                onSelectLog={onSelectLog}
              />
            </div>
          ))}
          {hiddenHospitals > 0 && (
            <button
              onClick={() => setShowAllHospitals(true)}
              className="w-full border-t border-line-soft px-3 py-2 text-left text-xs text-ink-2 hover:bg-panel hover:text-ink"
            >
              외 {hiddenHospitals}곳 더 보기
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <DetailHeading
          title="최근 발생"
          hint={`버전 ${group.versions.join(", ")}`}
        />
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          {recent.map((log) => (
            <button
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="grid h-[34px] w-full grid-cols-[96px_minmax(0,1fr)_minmax(0,0.7fr)] items-center gap-2.5 border-b border-line-soft px-3 text-left hover:bg-panel"
            >
              <span className="font-medium tabular-nums">
                {formatLogTime(log.createdAt)}
              </span>
              <span className="truncate">
                {hospitalName(log.ykiho) || log.ykiho}
              </span>
              <span className="truncate text-ink-2">{log.computerName}</span>
            </button>
          ))}
          {group.count > RECENT_LIMIT && (
            <div className="px-3 py-2 text-xs tabular-nums text-ink-2">
              외 {(group.count - RECENT_LIMIT).toLocaleString()}건
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
