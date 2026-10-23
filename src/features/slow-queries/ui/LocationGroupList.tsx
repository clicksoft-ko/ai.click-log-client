import { cn } from "@/shared/utils";
import {
  ChipList,
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
import { useMemo, useState } from "react";
import { SlowQuery } from "../models/slow-query";
import {
  buildLocationGroups,
  durationTier,
  formatQueryTime,
  formatSeconds,
  HospitalNameFn,
  LocationGroup,
  LocationSort,
} from "../utils/slow-query-groups";
import { DurationMeter } from "./DurationMeter";
import { LocationName } from "./LocationName";

const SLOWEST_LIMIT = 5;
const HOSPITAL_LIMIT = 8;
const COLUMNS =
  "grid-cols-[minmax(0,1fr)_76px_60px_60px_76px_168px_128px_20px]";
const columns: ColumnDef<LocationGroup, unknown>[] = [];

interface LocationGroupListProps {
  /** 검색어까지 걸러진 최신순 쿼리 */
  queries: SlowQuery[];
  hospitalName: HospitalNameFn;
  sort: LocationSort;
  multiHospitalOnly: boolean;
  onSelectQuery: (query: SlowQuery) => void;
}

export const LocationGroupList = ({
  queries,
  hospitalName,
  sort,
  multiHospitalOnly,
  onSelectQuery,
}: LocationGroupListProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const groups = useMemo(() => {
    const all = buildLocationGroups(queries, hospitalName, sort);
    return multiHospitalOnly
      ? all.filter((group) => group.hospitals.length > 1)
      : all;
  }, [queries, hospitalName, sort, multiHospitalOnly]);

  const table = useReactTableEx({
    data: groups,
    columns,
  });

  return (
    <TableCard>
      <div className="overflow-x-auto">
        <div className="min-w-[1080px]">
          <GroupHeader className={COLUMNS}>
            <span>위치</span>
            <span>발생</span>
            <span>병원</span>
            <span>컴퓨터</span>
            <span className="text-right">중앙값</span>
            <span className="text-right">가장 느림</span>
            <span>최근 발생</span>
            <span />
          </GroupHeader>
          {table.getRowModel().rows.map(({ original: group }) => {
            const open = openKey === group.key;
            const medianTier = durationTier(group.median);
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
                  <LocationName
                    assemblyName={group.assemblyName}
                    className={group.className}
                    methodName={group.methodName}
                  />
                  <CountText
                    value={group.count}
                    unit="건"
                    className="text-[17px] tracking-tight"
                  />
                  <CountText value={group.hospitals.length} unit="곳" />
                  <CountText value={group.computerCount} unit="대" />
                  <span
                    className={cn("text-right tabular-nums", medianTier.text)}
                  >
                    {formatSeconds(group.median)}초
                  </span>
                  <DurationMeter seconds={group.slowest.executionSeconds} />
                  <span className="font-medium tabular-nums">
                    {formatQueryTime(group.latest.createdAt)}
                  </span>
                  <ExpandChevron open={open} />
                </button>

                {open && (
                  <LocationGroupDetail
                    group={group}
                    hospitalName={hospitalName}
                    onSelectQuery={onSelectQuery}
                  />
                )}
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="py-10 text-center text-ink-3">
              조건에 맞는 쿼리가 없습니다.
            </div>
          )}
        </div>
      </div>
      <TablePagination table={table} />
    </TableCard>
  );
};

const LocationGroupDetail = ({
  group,
  hospitalName,
  onSelectQuery,
}: {
  group: LocationGroup;
  hospitalName: HospitalNameFn;
  onSelectQuery: (query: SlowQuery) => void;
}) => {
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const hospitals = showAllHospitals
    ? group.hospitals
    : group.hospitals.slice(0, HOSPITAL_LIMIT);
  const hiddenHospitals = group.hospitals.length - hospitals.length;
  const slowest = [...group.queries]
    .sort((a, b) => b.executionSeconds - a.executionSeconds)
    .slice(0, SLOWEST_LIMIT);

  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5 px-4 pb-4 pt-0.5">
      <div className="flex flex-col gap-1.5">
        <DetailHeading
          title="병원별 분포"
          hint="컴퓨터를 누르면 그 컴퓨터에서 가장 느렸던 쿼리가 열립니다"
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
                  최근 {formatQueryTime(hospital.latest.createdAt)}
                </span>
              </div>
              <div className="tabular-nums leading-snug">
                <b className="font-semibold">{hospital.count}</b>건
                <br />
                <span className="text-[11.5px] text-ink-3">
                  컴퓨터 {hospital.computers.length}대
                </span>
              </div>
              <ChipList
                title="이 컴퓨터에서 가장 느렸던 쿼리 보기"
                items={hospital.computers.map((computer) => ({
                  key: computer.name,
                  label: computer.name,
                  count: computer.count,
                  onClick: () => onSelectQuery(computer.slowest),
                }))}
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
        <DetailHeading title="가장 느린 쿼리" />
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          {slowest.map((query) => (
            <button
              key={query.id}
              onClick={() => onSelectQuery(query)}
              className="grid h-[34px] w-full grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-line-soft px-3 text-left last:border-b-0 hover:bg-panel"
            >
              <span className="font-medium tabular-nums">
                {formatQueryTime(query.createdAt)}
              </span>
              <span className="truncate">
                {hospitalName(query.ykiho) || query.ykiho}
                <span className="ml-2 text-ink-2">{query.computerName}</span>
              </span>
              <DurationMeter seconds={query.executionSeconds} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
