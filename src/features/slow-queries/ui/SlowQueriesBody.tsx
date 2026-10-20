import { useCsNames } from "@/features/_common";
import { SearchFilter } from "@/widgets/filters";
import { Loading } from "@/widgets/loading";
import {
  CommonTable,
  tableFilterFn,
  TablePagination,
  useReactTableEx,
} from "@/widgets/table-pagination";
import BodyWrapper from "@/widgets/wappers/BodyWrapper";
import { useMemo, useState } from "react";
import useFetchSlowQueries from "../hooks/use-fetch-slow-queries";
import { useSlowQueryColumns } from "../hooks/use-slow-query-columns";
import { SlowQuery } from "../models/slow-query";
import { SlowQueryDialog } from "./SlowQueryDialog";

const SlowQueriesBody = () => {
  const [selectedData, setSelectedData] = useState<SlowQuery | null>(null);
  const { csNameMap } = useCsNames();
  const [open, setOpen] = useState(false);
  const { columns, sorting, setSorting } = useSlowQueryColumns(csNameMap);
  const globalFilterFn = useMemo(
    () => tableFilterFn.bind(null, csNameMap),
    [csNameMap],
  );
  const { data, isPending, mutate } = useFetchSlowQueries();
  const table = useReactTableEx({
    data: data ?? [],
    columns,
    globalFilterFn,
    sorting,
    onSortingChange: setSorting,
  });

  return (
    <BodyWrapper>
      {isPending && (
        <Loading>
          <div>슬로우 쿼리를 조회 중입니다.</div>
        </Loading>
      )}
      <SearchFilter onSearch={mutate} isPending={isPending} />
      <CommonTable
        table={table}
        onRowClick={(data) => {
          setSelectedData(data);
          setOpen(true);
        }}
      />
      <SlowQueryDialog
        isOpen={open}
        onOpenChange={setOpen}
        slowQuery={selectedData}
      />
      <TablePagination table={table} />
    </BodyWrapper>
  );
};

export default SlowQueriesBody;
