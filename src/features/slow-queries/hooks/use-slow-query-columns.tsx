import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { SlowQuery } from "../models/slow-query";

const columnHelper = createColumnHelper<SlowQuery>();

export const useSlowQueryColumns = (
  csNameMap: Map<string, string> | undefined,
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "발생시간",
        cell: (info) => format(info.getValue(), "yy-MM-dd HH:mm:ss"),
      }),
      columnHelper.accessor("ykiho", {
        header: "병원명",
        cell: (info) => csNameMap?.get(info.getValue()) || "",
      }),
      columnHelper.accessor("computerName", {
        header: "컴퓨터명",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("assemblyName", {
        header: "어셈블리",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("className", {
        header: "클래스",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("methodName", {
        header: "메소드",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("queryString", {
        header: "쿼리",
        cell: (info) => (
          <div className="max-w-xs truncate"> {info.getValue()} </div>
        ),
      }),
      columnHelper.accessor("executionSeconds", {
        header: "시간(초)",
        cell: (info) => (
          <div className="text-right">{Math.round(info.getValue())}</div>
        ),
      }),
    ],
    [csNameMap],
  );

  return { columns, sorting, setSorting };
};
