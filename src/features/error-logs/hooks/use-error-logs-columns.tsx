import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ErrorLog } from "../models/types";
import { format } from "date-fns";

const columnHelper = createColumnHelper<ErrorLog>();

export const useErrorLogsColumns = (
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
      columnHelper.accessor("moduleName", {
        header: "모듈",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("logLevel", {
        header: "레벨",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("exceptionType", {
        header: "예외 타입",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("errorMessage", {
        header: "에러 메시지",
        cell: (info) => (
          <div className="max-w-xs truncate"> {info.getValue()} </div>
        ),
      }),
      columnHelper.accessor("clientVersion", {
        header: "버전",
        cell: (info) => info.getValue(),
      }),
    ],
    [csNameMap],
  );

  return { columns, sorting, setSorting };
};
