import { useCsNames } from "@/features/_common";
import { SearchFilter, useSearchFilter } from "@/widgets/filters";
import { SkeletonRows } from "@/widgets/loading";
import {
  countByHour,
  futureHourFrom,
  SummaryBand,
} from "@/widgets/summary-band";
import { TableCard, useTablePagination } from "@/widgets/table-pagination";
import {
  CheckOption,
  SegmentedControl,
  ViewTab,
  ViewTabs,
} from "@/widgets/view-tabs";
import BodyWrapper from "@/widgets/wappers/BodyWrapper";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useErrorLogsColumns } from "../hooks/use-error-logs-columns";
import useFetchErrorLogs from "../hooks/use-fetch-error-logs";
import { ErrorLog } from "../models/types";
import {
  collapseConsecutive,
  errorKey,
  GroupSort,
  keepMatchedRows,
  matchesSearch,
} from "../utils/error-log-groups";
import { isCriticalLevel } from "../utils/level-badge";
import { ErrorGroupList } from "./ErrorGroupList";
import { ErrorLogDetailModal } from "./ErrorLogDetailModal";
import { FlatLogTable } from "./FlatLogTable";
import { HospitalGroupList } from "./HospitalGroupList";

type ViewMode = "flat" | "error" | "hospital";

const SORT_OPTIONS: { value: GroupSort; label: string }[] = [
  { value: "count", label: "건수순" },
  { value: "recent", label: "최근 발생순" },
];

const HOUR_SERIES = [
  { label: "ERROR", barClassName: "bg-[#EE8A7E]" },
  { label: "CRITICAL", barClassName: "bg-crit" },
];

export const ErrorLogsBody = () => {
  // 기존 사용자를 위해 전체 로그가 기본
  const [view, setView] = useState<ViewMode>("flat");
  const [collapse, setCollapse] = useState(true);
  const [errorSort, setErrorSort] = useState<GroupSort>("count");
  const [multiHospitalOnly, setMultiHospitalOnly] = useState(false);
  const [hospitalSort, setHospitalSort] = useState<GroupSort>("count");
  const [multiComputerOnly, setMultiComputerOnly] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const { csNameMap } = useCsNames();
  const { setPageIndex } = useTablePagination();
  const { searchText, dateRange } = useSearchFilter();
  // 입력은 즉시 반영하고, 대량 행 필터링은 낮은 우선순위로 처리
  const deferredSearchText = useDeferredValue(searchText);
  const { data, isPending, mutate } = useFetchErrorLogs();
  const { columns, sorting, setSorting } = useErrorLogsColumns(csNameMap);

  const hospitalName = useCallback(
    (ykiho: string) => csNameMap?.get(ykiho) || "",
    [csNameMap],
  );

  // 세 탭이 같은 검색 결과를 각자 방식으로 보여준다
  const logs = useMemo(
    () =>
      data.filter((log) =>
        matchesSearch(log, hospitalName, deferredSearchText),
      ),
    [data, hospitalName, deferredSearchText],
  );

  // 연달아 났는지는 검색 전 전체 흐름으로 판단한다 (검색어가 바뀌어도 다시 접지 않는다)
  const collapsedRows = useMemo(() => collapseConsecutive(data), [data]);

  const flatRows = useMemo(() => {
    if (!collapse) return logs;
    if (logs.length === data.length) return collapsedRows;
    return keepMatchedRows(collapsedRows, new Set(logs));
  }, [collapse, logs, data.length, collapsedRows]);

  const summary = useMemo(() => {
    const critical = logs.filter((log) => isCriticalLevel(log.logLevel));
    return {
      critical: critical.length,
      errorKinds: new Set(logs.map(errorKey)).size,
      hospitals: new Set(logs.map((log) => log.ykiho)).size,
      computers: new Set(logs.map((log) => `${log.ykiho}|${log.computerName}`))
        .size,
      hours: countByHour(
        logs,
        (log) => log.createdAt,
        HOUR_SERIES.length,
        (log) => (isCriticalLevel(log.logLevel) ? 1 : 0),
      ),
    };
  }, [logs]);

  // 조회 중에는 건수 대신 빈 자리를 둔다 (0건으로 보이지 않게)
  const count = (value: number) => (isPending ? undefined : value);

  const tabs: ViewTab<ViewMode>[] = [
    { value: "flat", label: "전체 로그", count: count(logs.length) },
    {
      value: "error",
      label: "오류별 묶음",
      count: count(summary.errorKinds),
      title:
        "모듈 · 예외 타입 · 메시지가 같으면 한 묶음입니다. 메시지 속 IP·긴 숫자는 같은 값으로 봅니다.",
    },
    {
      value: "hospital",
      label: "병원별 묶음",
      count: count(summary.hospitals),
      title: "병원마다 어떤 오류가 몇 대의 컴퓨터에서 났는지 봅니다.",
    },
  ];

  const changeView = (next: ViewMode) => {
    setView(next);
    setPageIndex(0);
  };

  return (
    <BodyWrapper>
      <SearchFilter
        onSearch={mutate}
        isPending={isPending}
        placeholder="병원, 컴퓨터, 예외, 메시지 검색"
      />

      <SummaryBand
        label="에러 로그"
        stats={[
          { label: "로그", value: logs.length.toLocaleString() },
          {
            label: "CRITICAL",
            value: summary.critical.toLocaleString(),
            valueClassName: summary.critical > 0 ? "text-crit" : undefined,
          },
          { label: "오류 종류", value: summary.errorKinds.toLocaleString() },
          { label: "병원", value: summary.hospitals.toLocaleString() },
          { label: "컴퓨터", value: summary.computers.toLocaleString() },
        ]}
        hours={summary.hours}
        series={HOUR_SERIES}
        futureFrom={futureHourFrom(dateRange)}
        latestAt={logs[0]?.createdAt}
        isLoading={isPending}
      />

      <ViewTabs tabs={tabs} value={view} onChange={changeView}>
        {view === "flat" && (
          <CheckOption checked={collapse} onChange={setCollapse}>
            연달아 난 같은 오류 접기
            {collapse && flatRows.length !== logs.length && (
              <span className="ml-1 tabular-nums text-ink-3">
                {logs.length.toLocaleString()}건을{" "}
                {flatRows.length.toLocaleString()}줄로
              </span>
            )}
          </CheckOption>
        )}
        {view === "error" && (
          <>
            <SegmentedControl
              label="정렬"
              options={SORT_OPTIONS}
              value={errorSort}
              onChange={setErrorSort}
            />
            <CheckOption
              checked={multiHospitalOnly}
              onChange={setMultiHospitalOnly}
            >
              여러 병원에서 난 오류만
            </CheckOption>
          </>
        )}
        {view === "hospital" && (
          <>
            <SegmentedControl
              label="정렬"
              options={SORT_OPTIONS}
              value={hospitalSort}
              onChange={setHospitalSort}
            />
            <CheckOption
              checked={multiComputerOnly}
              onChange={setMultiComputerOnly}
            >
              컴퓨터 여러 대에서 난 오류만
            </CheckOption>
          </>
        )}
      </ViewTabs>

      {view === "flat" && (
        <FlatLogTable
          rows={flatRows}
          columns={columns}
          sorting={sorting}
          onSortingChange={setSorting}
          onSelectLog={setSelectedLog}
          isLoading={isPending}
        />
      )}
      {view !== "flat" && isPending && (
        <TableCard isLoading loadingLabel="에러 로그를 불러오는 중입니다.">
          <SkeletonRows />
        </TableCard>
      )}
      {view === "error" && !isPending && (
        <ErrorGroupList
          logs={logs}
          hospitalName={hospitalName}
          sort={errorSort}
          multiHospitalOnly={multiHospitalOnly}
          onSelectLog={setSelectedLog}
        />
      )}
      {view === "hospital" && !isPending && (
        <HospitalGroupList
          logs={logs}
          hospitalName={hospitalName}
          sort={hospitalSort}
          multiComputerOnly={multiComputerOnly}
          onSelectLog={setSelectedLog}
        />
      )}

      {selectedLog && (
        <ErrorLogDetailModal
          csNameMap={csNameMap}
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </BodyWrapper>
  );
};
