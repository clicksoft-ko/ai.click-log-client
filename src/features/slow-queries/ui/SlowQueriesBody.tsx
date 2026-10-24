import { useCsNames } from "@/features/_common";
import { SearchFilter, useSearchFilter } from "@/widgets/filters";
import { SkeletonRows } from "@/widgets/loading";
import {
  countByHour,
  futureHourFrom,
  SummaryBand,
} from "@/widgets/summary-band";
import {
  CommonTable,
  TableCard,
  TablePagination,
  useReactTableEx,
  useTablePagination,
} from "@/widgets/table-pagination";
import {
  CheckOption,
  SegmentedControl,
  ViewTab,
  ViewTabs,
} from "@/widgets/view-tabs";
import BodyWrapper from "@/widgets/wappers/BodyWrapper";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import useFetchSlowQueries from "../hooks/use-fetch-slow-queries";
import { useSlowQueryColumns } from "../hooks/use-slow-query-columns";
import { SlowQuery } from "../models/slow-query";
import {
  durationTier,
  formatSeconds,
  locationKey,
  LocationSort,
  matchesSlowQuerySearch,
  secondsSummary,
} from "../utils/slow-query-groups";
import { DurationLegend } from "./DurationMeter";
import { LocationGroupList } from "./LocationGroupList";
import { SlowQueryDialog } from "./SlowQueryDialog";

type ViewMode = "flat" | "location";

const SORT_OPTIONS: { value: LocationSort; label: string }[] = [
  { value: "count", label: "건수순" },
  { value: "slowest", label: "가장 느린 순" },
  { value: "recent", label: "최근 발생순" },
];

const HOUR_SERIES = [{ label: "쿼리", barClassName: "bg-[#6C7FA8]" }];

const SlowQueriesBody = () => {
  const [view, setView] = useState<ViewMode>("flat");
  const [locationSort, setLocationSort] = useState<LocationSort>("count");
  const [multiHospitalOnly, setMultiHospitalOnly] = useState(false);
  const [selectedData, setSelectedData] = useState<SlowQuery | null>(null);
  const [open, setOpen] = useState(false);
  const { csNameMap } = useCsNames();
  const { setPageIndex } = useTablePagination();
  const { searchText, dateRange } = useSearchFilter();
  const deferredSearchText = useDeferredValue(searchText);
  const { columns, sorting, setSorting } = useSlowQueryColumns(csNameMap);
  const { data, isPending, mutate } = useFetchSlowQueries();

  const hospitalName = useCallback(
    (ykiho: string) => csNameMap?.get(ykiho) || "",
    [csNameMap],
  );

  // 두 탭이 같은 검색 결과를 쓴다
  const queries = useMemo(
    () =>
      (data ?? []).filter((query) =>
        matchesSlowQuerySearch(query, hospitalName, deferredSearchText),
      ),
    [data, hospitalName, deferredSearchText],
  );

  const summary = useMemo(() => {
    const seconds = secondsSummary(queries.map((q) => q.executionSeconds));
    return {
      hospitals: new Set(queries.map((q) => q.ykiho)).size,
      computers: new Set(queries.map((q) => `${q.ykiho}|${q.computerName}`))
        .size,
      locations: new Set(queries.map(locationKey)).size,
      seconds,
      hours: countByHour(queries, (q) => q.createdAt, HOUR_SERIES.length),
    };
  }, [queries]);

  const table = useReactTableEx({
    data: queries,
    columns,
    sorting,
    onSortingChange: setSorting,
  });

  const selectQuery = (query: SlowQuery) => {
    setSelectedData(query);
    setOpen(true);
  };

  const changeView = (next: ViewMode) => {
    setView(next);
    setPageIndex(0);
  };

  // 조회 중에는 건수 대신 빈 자리를 둔다 (0건으로 보이지 않게)
  const count = (value: number) => (isPending ? undefined : value);

  const tabs: ViewTab<ViewMode>[] = [
    { value: "flat", label: "전체 쿼리", count: count(queries.length) },
    {
      value: "location",
      label: "위치별 묶음",
      count: count(summary.locations),
      title: "어셈블리 · 클래스 · 메서드가 같으면 한 묶음입니다.",
    },
  ];

  const secondsStat = (
    label: string,
    value: number | undefined,
    colored = false,
  ) => ({
    label,
    value: value === undefined ? "-" : formatSeconds(value),
    unit: value === undefined ? undefined : "초",
    valueClassName:
      colored && value !== undefined ? durationTier(value).text : undefined,
  });

  return (
    <BodyWrapper>
      <SearchFilter
        onSearch={mutate}
        isPending={isPending}
        placeholder="병원, 컴퓨터, 클래스.메서드, 쿼리 검색"
      />

      <SummaryBand
        label="슬로우 쿼리"
        stats={[
          { label: "쿼리", value: queries.length.toLocaleString() },
          { label: "병원", value: summary.hospitals.toLocaleString() },
          { label: "컴퓨터", value: summary.computers.toLocaleString() },
          secondsStat("중앙값", summary.seconds?.median),
          secondsStat("상위 5%", summary.seconds?.p95, true),
          secondsStat("가장 느림", summary.seconds?.max, true),
        ]}
        hours={summary.hours}
        series={HOUR_SERIES}
        peakBarClassName="bg-navy"
        futureFrom={futureHourFrom(dateRange)}
        latestAt={queries[0]?.createdAt}
        isLoading={isPending}
      />

      <ViewTabs tabs={tabs} value={view} onChange={changeView}>
        {view === "flat" && <DurationLegend />}
        {view === "location" && (
          <>
            <SegmentedControl
              label="정렬"
              options={SORT_OPTIONS}
              value={locationSort}
              onChange={setLocationSort}
            />
            <CheckOption
              checked={multiHospitalOnly}
              onChange={setMultiHospitalOnly}
            >
              여러 병원에서 난 것만
            </CheckOption>
          </>
        )}
      </ViewTabs>

      {view === "flat" && (
        <TableCard
          isLoading={isPending}
          loadingLabel="슬로우 쿼리를 불러오는 중입니다."
        >
          <CommonTable
            table={table}
            onRowClick={selectQuery}
            isLoading={isPending}
          />
          {!isPending && <TablePagination table={table} />}
        </TableCard>
      )}
      {view === "location" && isPending && (
        <TableCard isLoading loadingLabel="슬로우 쿼리를 불러오는 중입니다.">
          <SkeletonRows />
        </TableCard>
      )}
      {view === "location" && !isPending && (
        <LocationGroupList
          queries={queries}
          hospitalName={hospitalName}
          sort={locationSort}
          multiHospitalOnly={multiHospitalOnly}
          onSelectQuery={selectQuery}
        />
      )}

      <SlowQueryDialog
        isOpen={open}
        onOpenChange={setOpen}
        slowQuery={selectedData}
        hospitalName={hospitalName}
      />
    </BodyWrapper>
  );
};

export default SlowQueriesBody;
