import { Table } from "@tanstack/react-table";
import { cn } from "@/shared/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/widgets/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTablePagination } from "../context/TablePaginationContext";

interface TablePaginationProps<T> {
  table: Table<T>;
}

const PAGE_WINDOW = 7;

const pageButtonClass =
  "inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-md px-1.5 tabular-nums text-ink hover:bg-ground disabled:pointer-events-none disabled:opacity-40";

export const TablePagination = <T,>({ table }: TablePaginationProps<T>) => {
  const { pageSize, setPageSize, pageIndex, setPageIndex } =
    useTablePagination();
  const total = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  // 현재 페이지를 가운데 두는 최대 7칸
  const start =
    pageCount <= PAGE_WINDOW
      ? 0
      : Math.min(Math.max(currentPage - 3, 0), pageCount - PAGE_WINDOW);
  const pages = Array.from(
    { length: Math.min(PAGE_WINDOW, pageCount) },
    (_, i) => start + i,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-[12.5px] text-ink-2">
      <span className="min-w-[140px] tabular-nums">
        {total === 0
          ? "0개"
          : `총 ${total.toLocaleString()}개 중 ${(pageIndex * pageSize + 1).toLocaleString()}–${Math.min((pageIndex + 1) * pageSize, total).toLocaleString()}`}
      </span>
      <nav aria-label="페이지" className="flex items-center gap-0.5">
        <button
          aria-label="처음 페이지"
          disabled={!table.getCanPreviousPage()}
          onClick={() => setPageIndex(0)}
          className={pageButtonClass}
        >
          <ChevronsLeft size={15} />
        </button>
        <button
          aria-label="이전 페이지"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className={pageButtonClass}
        >
          <ChevronLeft size={15} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => setPageIndex(page)}
            className={cn(
              pageButtonClass,
              page === currentPage &&
                "bg-navy font-semibold text-white hover:bg-navy",
            )}
          >
            {page + 1}
          </button>
        ))}
        <button
          aria-label="다음 페이지"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          className={pageButtonClass}
        >
          <ChevronRight size={15} />
        </button>
        <button
          aria-label="끝 페이지"
          disabled={!table.getCanNextPage()}
          onClick={() => setPageIndex(pageCount - 1)}
          className={pageButtonClass}
        >
          <ChevronsRight size={15} />
        </button>
      </nav>
      <div className="flex min-w-[140px] justify-end">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPageIndex(0);
          }}
        >
          <SelectTrigger
            aria-label="페이지 크기"
            className="h-[30px] w-[88px] border-line-strong text-[12.5px]"
          >
            <SelectValue placeholder="페이지 크기" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10개씩</SelectItem>
              <SelectItem value="20">20개씩</SelectItem>
              <SelectItem value="30">30개씩</SelectItem>
              <SelectItem value="50">50개씩</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
