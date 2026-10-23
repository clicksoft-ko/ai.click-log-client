import { cn } from "@/shared/utils";
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
}

export const CommonTable = <T,>({ table, onRowClick }: CommonTableProps<T>) => {
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
          {table.getRowModel().rows.map((row) => (
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

/** 표와 페이지 나누기를 한 판으로 묶는 테두리 */
export const TableCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "overflow-hidden rounded-[10px] border border-line bg-white",
      className,
    )}
  >
    {children}
  </div>
);
