import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ErrorLogRow } from "../models/types";
import { format } from "date-fns";

const columnHelper = createColumnHelper<ErrorLogRow>();

export const useErrorLogsColumns = (
  csNameMap: Map<string, string> | undefined,
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "발생시간",
        cell: (info) => {
          const repeat = info.row.original.repeatCount ?? 1;
          return (
            <>
              {format(info.getValue(), "yy-MM-dd HH:mm:ss")}
              {repeat > 1 && (
                <span
                  title={`같은 컴퓨터에서 연달아 ${repeat}번 발생`}
                  className="ml-1.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-xs font-bold text-white"
                >
                  ×{repeat}
                </span>
              )}
            </>
          );
        },
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
