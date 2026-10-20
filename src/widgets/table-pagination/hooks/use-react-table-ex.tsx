import { useSearchFilter } from "@/widgets/filters";
import {
  ColumnDef,
  FilterFnOption,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useDeferredValue } from "react";
import { useTablePagination } from "../context/TablePaginationContext";

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  globalFilterFn?: FilterFnOption<T> | undefined;
  sorting?: SortingState | undefined;
  onSortingChange?: (updater: any) => void;
}

export function useReactTableEx<T>({
  data,
  columns,
  globalFilterFn,
  sorting,
  onSortingChange,
}: Props<T>) {
  const { searchText } = useSearchFilter();
  // 입력은 즉시 반영하고, 대량 행 필터링은 낮은 우선순위로 처리
  const deferredSearchText = useDeferredValue(searchText);
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
      globalFilter: deferredSearchText,
      pagination: {
        pageSize,
        pageIndex,
      },
      sorting,
    },
    onSortingChange,
    globalFilterFn,
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
