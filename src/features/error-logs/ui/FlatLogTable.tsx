import {
  CommonTable,
  TableCard,
  TablePagination,
  useReactTableEx,
} from "@/widgets/table-pagination";
import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ErrorLog, ErrorLogRow } from "../models/types";

interface FlatLogTableProps {
  /** 검색어까지 걸러지고 (필요하면) 접힌 최신순 행 */
  rows: ErrorLogRow[];
  columns: ColumnDef<ErrorLogRow, unknown>[];
  // 탭을 오가도 정렬이 남도록 상태는 본문이 들고 있다
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  onSelectLog: (log: ErrorLog) => void;
  isLoading: boolean;
}

export const FlatLogTable = ({
  rows,
  columns,
  sorting,
  onSortingChange,
  onSelectLog,
  isLoading,
}: FlatLogTableProps) => {
  const table = useReactTableEx({
    data: rows,
    columns,
    sorting,
    onSortingChange,
  });

  return (
    <TableCard
      isLoading={isLoading}
      loadingLabel="에러 로그를 불러오는 중입니다."
    >
      <CommonTable
        table={table}
        onRowClick={onSelectLog}
        isLoading={isLoading}
      />
      {!isLoading && <TablePagination table={table} />}
    </TableCard>
  );
};
