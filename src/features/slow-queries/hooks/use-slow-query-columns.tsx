import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { SlowQuery } from "../models/slow-query";
import { DurationMeter } from "../ui/DurationMeter";
import { LocationName } from "../ui/LocationName";

const columnHelper = createColumnHelper<SlowQuery>();

export const useSlowQueryColumns = (
  csNameMap: Map<string, string> | undefined,
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "발생시간",
        cell: (info) => (
          <span className="tabular-nums">
            <span className="text-ink-3">
              {format(info.getValue(), "MM-dd")}
            </span>{" "}
            <span className="font-medium">
              {format(info.getValue(), "HH:mm:ss")}
            </span>
          </span>
        ),
      }),
      columnHelper.accessor("ykiho", {
        header: "병원",
        cell: (info) => csNameMap?.get(info.getValue()) || "",
      }),
      columnHelper.accessor("computerName", {
        header: "컴퓨터",
        cell: (info) => <span className="text-ink-2">{info.getValue()}</span>,
      }),
      columnHelper.accessor(
        (row) => `${row.assemblyName}.${row.className}.${row.methodName}`,
        {
          id: "location",
          header: "위치",
          cell: (info) => (
            <LocationName
              assemblyName={info.row.original.assemblyName}
              className={info.row.original.className}
              methodName={info.row.original.methodName}
            />
          ),
        },
      ),
      columnHelper.accessor("queryString", {
        header: "쿼리",
        cell: (info) => (
          <div className="max-w-[420px] truncate font-mono text-xs text-[#2B3445]">
            {info.getValue().replace(/\s+/g, " ")}
          </div>
        ),
      }),
      columnHelper.accessor("executionSeconds", {
        header: "실행시간",
        meta: { className: "text-right" },
        cell: (info) => <DurationMeter seconds={info.getValue()} />,
      }),
    ],
    [csNameMap],
  );

  return { columns, sorting, setSorting };
};
