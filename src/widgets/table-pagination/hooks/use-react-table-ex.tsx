import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useTablePagination } from "../context/TablePaginationContext";

interface Props<T> {
  /** 검색어까지 이미 걸러진 행. 표는 정렬과 페이지 나누기만 맡는다 */
  data: T[];
  columns: ColumnDef<T, unknown>[];
  sorting?: SortingState | undefined;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function useReactTableEx<T>({
  data,
  columns,
  sorting,
  onSortingChange,
}: Props<T>) {
  const { pageSize, pageIndex, setPageIndex, setPageSize } =
    useTablePagination();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination: {
        pageSize,
        pageIndex,
      },
      sorting,
    },
    onSortingChange,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
  });

  return table;
}
