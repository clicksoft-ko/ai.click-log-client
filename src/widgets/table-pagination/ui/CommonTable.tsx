import { cn } from "@/shared/utils";
import { LoadingBar, Skeleton } from "@/widgets/loading";
import { flexRender, RowData, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** 머리글·칸 모두에 붙는 클래스 (예: 오른쪽 정렬) */
    className?: string;
  }
}

interface CommonTableProps<T> {
  table: Table<T>;
  onRowClick: (data: T) => void;
  /** 조회 중이면 머리글은 두고 행 자리에 빈 막대를 보인다 */
  isLoading?: boolean;
}

const SKELETON_ROWS = 10;
// 칸마다 길이를 조금씩 달리해 실제 표처럼 보이게 한다
const SKELETON_WIDTHS = ["72%", "54%", "86%", "62%", "44%", "78%", "58%"];

export const CommonTable = <T,>({
  table,
  onRowClick,
  isLoading = false,
}: CommonTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-[13px]">
        <thead className="bg-panel">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                    className={cn(
                      "whitespace-nowrap border-b border-line px-3 py-2 text-left font-medium text-ink-2 first:pl-4 last:pr-4",
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 font-medium hover:text-ink"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sorted === "asc" && (
                          <ChevronUp size={14} aria-hidden />
                        )}
                        {sorted === "desc" && (
                          <ChevronDown size={14} aria-hidden />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading && <SkeletonBody table={table} />}
          {!isLoading &&
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="h-9 cursor-pointer hover:bg-panel"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap border-b border-line-soft px-3 py-1 align-middle first:pl-4 last:pr-4",
                      cell.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const SkeletonBody = <T,>({ table }: { table: Table<T> }) => {
  const columns = table.getVisibleLeafColumns();
  return Array.from({ length: SKELETON_ROWS }, (_, row) => (
    <tr key={row} aria-hidden className="h-9">
      {columns.map((column, col) => (
        <td
          key={column.id}
          className="border-b border-line-soft px-3 py-1 first:pl-4 last:pr-4"
        >
          <Skeleton
            className="h-3"
            width={SKELETON_WIDTHS[(row * 3 + col) % SKELETON_WIDTHS.length]}
          />
        </td>
      ))}
    </tr>
  ));
};

/** 표와 페이지 나누기를 한 판으로 묶는 테두리 */
export const TableCard = ({
  children,
  className,
  isLoading = false,
  loadingLabel = "불러오는 중입니다.",
}: {
  children: React.ReactNode;
  className?: string;
  /** 조회 중이면 위 가장자리에 진행 막대를 띄운다 */
  isLoading?: boolean;
  loadingLabel?: string;
}) => (
  <div
    aria-busy={isLoading}
    className={cn(
      "relative overflow-hidden rounded-[10px] border border-line bg-white",
      className,
    )}
  >
    {isLoading && (
      <div role="status" className="absolute inset-x-0 top-0 z-10">
        <LoadingBar />
        <span className="sr-only">{loadingLabel}</span>
      </div>
    )}
    {children}
  </div>
);
