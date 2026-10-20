import { useCsNames } from "@/features/_common";
import { SearchFilter } from "@/widgets/filters";
import { Loading } from "@/widgets/loading";
import {
  CommonTable,
  tableFilterFn,
  TablePagination,
  useReactTableEx,
} from "@/widgets/table-pagination";
import BodyWrapper from "@/widgets/wappers/BodyWrapper";
import { useMemo, useState } from "react";
import { useErrorLogsColumns } from "../hooks/use-error-logs-columns";
import useFetchErrorLogs from "../hooks/use-fetch-error-logs";
import { ErrorLog } from "../models/types";
import { ErrorLogDetailModal } from "./ErrorLogDetailModal";

export const ErrorLogsBody = () => {
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const { csNameMap } = useCsNames();
  const { columns, sorting, setSorting } = useErrorLogsColumns(csNameMap);
  const globalFilterFn = useMemo(
    () => tableFilterFn.bind(null, csNameMap),
    [csNameMap],
  );
  const { data, isPending, mutate } = useFetchErrorLogs();

  const table = useReactTableEx({
    data,
    columns,
    globalFilterFn,
    sorting,
    onSortingChange: setSorting,
  });

  return (
    <BodyWrapper>
      {isPending && (
        <Loading>
          <div>에러 로그를 조회 중입니다.</div>
        </Loading>
      )}
      <SearchFilter onSearch={mutate} isPending={isPending} />
      <CommonTable table={table} onRowClick={setSelectedLog} />

      {selectedLog && (
        <ErrorLogDetailModal
          csNameMap={csNameMap}
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      <TablePagination table={table} />
    </BodyWrapper>
  );
};
