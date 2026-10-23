import {
  CommonTable,
  TablePagination,
  useReactTableEx,
} from "@/widgets/table-pagination";
import { useMemo } from "react";
import { useErrorLogsColumns } from "../hooks/use-error-logs-columns";
import { ErrorLog } from "../models/types";
import { collapseConsecutive } from "../utils/error-log-groups";

interface FlatLogTableProps {
  /** 검색어까지 걸러진 최신순 로그 */
  logs: ErrorLog[];
  csNameMap: Map<string, string> | undefined;
  collapse: boolean;
  onCollapseChange: (collapse: boolean) => void;
  onSelectLog: (log: ErrorLog) => void;
}

export const FlatLogTable = ({
  logs,
  csNameMap,
  collapse,
  onCollapseChange,
  onSelectLog,
}: FlatLogTableProps) => {
  const { columns, sorting, setSorting } = useErrorLogsColumns(csNameMap);
  const rows = useMemo(
    () => (collapse ? collapseConsecutive(logs) : logs),
    [logs, collapse],
  );

  const table = useReactTableEx({
    data: rows,
    columns,
    sorting,
    onSortingChange: setSorting,
    manualFiltering: true,
  });

  return (
    <>
      <label className="inline-flex cursor-pointer items-center gap-2 self-start text-sm text-slate-700">
        <input
          type="checkbox"
          checked={collapse}
          onChange={(e) => onCollapseChange(e.target.checked)}
          className="h-4 w-4 accent-slate-900"
        />
        같은 컴퓨터에서 연달아 난 같은 오류는 한 줄로 접기
      </label>
      <CommonTable table={table} onRowClick={onSelectLog} />
      <TablePagination table={table} />
    </>
  );
};
