import { Table } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/widgets/ui/pagination";
import { cn } from "@/shared/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/widgets/ui/select";
import { useTablePagination } from "../context/TablePaginationContext";

interface TablePaginationProps<T> {
  table: Table<T>;
}

export const TablePagination = <T,>({ table }: TablePaginationProps<T>) => {
  const { pageSize, setPageSize, pageIndex, setPageIndex } =
    useTablePagination();

  return (
    <div className="relative flex items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="absolute right-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="whitespace-nowrap text-sm text-gray-700">
              총{" "}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>
              개 중{" "}
              <span className="font-medium">{pageIndex * pageSize + 1}</span>
              {" - "}
              <span className="font-medium">
                {Math.min(
                  (pageIndex + 1) * pageSize,
                  table.getFilteredRowModel().rows.length,
                )}
              </span>
              개 표시
            </p>
          </div>
          <div className="min-w-[5rem]">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="페이지 크기" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="30">30개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              onClick={() => setPageIndex(0)}
              className={cn(
                pageIndex === 0 && "pointer-events-none opacity-50",
                "cursor-pointer",
              )}
            >
              처음
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                !table.getCanPreviousPage() ? undefined : table.previousPage()
              }
              className={cn(
                !table.getCanPreviousPage() && "pointer-events-none opacity-50",
                "cursor-pointer",
              )}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(7, table.getPageCount()) }, (_, i) => {
            const currentPage = table.getState().pagination.pageIndex;
            const totalPages = table.getPageCount();
            let pageIndex = i;

            if (totalPages <= 7) {
              pageIndex = i;
            } else if (currentPage < 4) {
              pageIndex = i;
            } else if (currentPage > totalPages - 4) {
              pageIndex = totalPages - 7 + i;
            } else {
              pageIndex = currentPage - 3 + i;
            }

            return (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  className={cn(
                    table.getState().pagination.pageIndex === pageIndex &&
                      "bg-blue-200 font-bold",
                    "cursor-pointer",
                  )}
                  onClick={() => setPageIndex(pageIndex)}
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                !table.getCanNextPage() ? undefined : table.nextPage()
              }
              className={cn(
                !table.getCanNextPage() && "pointer-events-none opacity-50",
                "cursor-pointer",
              )}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              onClick={() => setPageIndex(table.getPageCount() - 1)}
              className={cn(
                (pageIndex === table.getPageCount() - 1 ||
                  !table.getCanNextPage()) &&
                  "pointer-events-none opacity-50",
                "cursor-pointer",
              )}
            >
              끝
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
