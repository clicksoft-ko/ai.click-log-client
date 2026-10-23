import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ErrorLogRow } from "../models/types";
import { format } from "date-fns";
import { ExceptionName, LevelBadge } from "../ui/GroupParts";

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
            <span className="tabular-nums">
              <span className="text-ink-3">
                {format(info.getValue(), "MM-dd")}
              </span>{" "}
              <span className="font-medium">
                {format(info.getValue(), "HH:mm:ss")}
              </span>
              {repeat > 1 && (
                <span
                  title={`같은 컴퓨터에서 연달아 ${repeat}번 발생`}
                  className="ml-1.5 inline-flex h-[18px] items-center rounded-full bg-navy px-1.5 text-[11px] font-semibold text-white"
                >
                  ×{repeat}
                </span>
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor("ykiho", {
        header: "병원",
        cell: (info) => csNameMap?.get(info.getValue()) || "",
      }),
      columnHelper.accessor("computerName", {
        header: "컴퓨터",
        cell: (info) => <span className="text-ink-2">{info.getValue()}</span>,
      }),
      columnHelper.accessor("moduleName", {
        header: "모듈",
        cell: (info) => (
          <span className="font-mono text-xs text-ink-2">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("logLevel", {
        header: "레벨",
        cell: (info) => <LevelBadge level={info.getValue()} />,
      }),
      columnHelper.accessor("exceptionType", {
        header: "예외",
        cell: (info) => <ExceptionName exceptionType={info.getValue()} />,
      }),
      columnHelper.accessor("errorMessage", {
        header: "메시지",
        cell: (info) => (
          <div className="max-w-[360px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("clientVersion", {
        header: "버전",
        cell: (info) => (
          <span className="font-mono text-xs tabular-nums text-ink-2">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [csNameMap],
  );

  return { columns, sorting, setSorting };
};
