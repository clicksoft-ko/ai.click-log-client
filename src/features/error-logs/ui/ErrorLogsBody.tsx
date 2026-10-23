import { useCsNames } from "@/features/_common";
import { cn } from "@/shared/utils";
import { SearchFilter, useSearchFilter } from "@/widgets/filters";
import { Loading } from "@/widgets/loading";
import { useTablePagination } from "@/widgets/table-pagination";
import BodyWrapper from "@/widgets/wappers/BodyWrapper";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import useFetchErrorLogs from "../hooks/use-fetch-error-logs";
import { ErrorLog } from "../models/types";
import { errorKey, matchesSearch } from "../utils/error-log-groups";
import { ErrorGroupList } from "./ErrorGroupList";
import { ErrorLogDetailModal } from "./ErrorLogDetailModal";
import { FlatLogTable } from "./FlatLogTable";
import { HospitalGroupList } from "./HospitalGroupList";

type ViewMode = "flat" | "error" | "hospital";

const VIEW_TABS: { value: ViewMode; label: string }[] = [
  { value: "flat", label: "전체 로그" },
  { value: "error", label: "오류별 묶음" },
  { value: "hospital", label: "병원별 묶음" },
];

export const ErrorLogsBody = () => {
  // 기존 사용자를 위해 전체 로그가 기본
  const [view, setView] = useState<ViewMode>("flat");
  const [collapse, setCollapse] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const { csNameMap } = useCsNames();
  const { setPageIndex } = useTablePagination();
  const { searchText } = useSearchFilter();
  // 입력은 즉시 반영하고, 대량 행 필터링은 낮은 우선순위로 처리
  const deferredSearchText = useDeferredValue(searchText);
  const { data, isPending, mutate } = useFetchErrorLogs();

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

  const summary = useMemo(
    () => [
      { label: "로그", value: logs.length, unit: "건" },
      { label: "오류", value: new Set(logs.map(errorKey)).size, unit: "종" },
      {
        label: "병원",
        value: new Set(logs.map((log) => log.ykiho)).size,
        unit: "곳",
      },
      {
        label: "컴퓨터",
        value: new Set(logs.map((log) => `${log.ykiho}|${log.computerName}`))
          .size,
        unit: "대",
      },
    ],
    [logs],
  );

  const changeView = (next: ViewMode) => {
    setView(next);
    setPageIndex(0);
  };

  return (
    <BodyWrapper>
      {isPending && (
        <Loading>
          <div>에러 로그를 조회 중입니다.</div>
        </Loading>
      )}
      <SearchFilter onSearch={mutate} isPending={isPending} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="보기 방식"
          className="flex gap-1 rounded-lg bg-slate-200 p-1"
        >
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={view === tab.value}
              onClick={() => changeView(tab.value)}
              className={cn(
                "h-9 rounded-md px-4 text-sm font-bold text-slate-600",
                view === tab.value && "bg-white text-slate-900 shadow-sm",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-slate-600">
          {summary.map(({ label, value, unit }) => (
            <span key={label}>
              {label}{" "}
              <b className="text-base text-slate-900">
                {value.toLocaleString()}
              </b>
              {unit}
            </span>
          ))}
        </div>
      </div>

      {view === "flat" && (
        <FlatLogTable
          logs={logs}
          csNameMap={csNameMap}
          collapse={collapse}
          onCollapseChange={setCollapse}
          onSelectLog={setSelectedLog}
        />
      )}
      {view === "error" && (
        <ErrorGroupList
          logs={logs}
          hospitalName={hospitalName}
          onSelectLog={setSelectedLog}
        />
      )}
      {view === "hospital" && (
        <HospitalGroupList
          logs={logs}
          hospitalName={hospitalName}
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
