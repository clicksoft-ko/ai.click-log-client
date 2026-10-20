import { axiosClient } from "@/shared/api";
import { SlowQuery } from "../models/slow-query";
import { apiPaths } from "@/shared/paths";
import { DateRange } from "react-day-picker";
import { compareDesc, format } from "date-fns";
import { DAILY_FETCH_CONCURRENCY } from "@/shared/constants/fetch";
import { loopDays, mapWithConcurrency } from "@/shared/utilities";

interface FetchSlowQueriesParams {
  ymd: string;
}

export const fetchSlowQueries = async ({
  ymd,
}: FetchSlowQueriesParams): Promise<SlowQuery[]> => {
  const response = await axiosClient.get(apiPaths.click.slowQuery, {
    params: { ymd },
  });

  return response.data;
};

export const fetchSlowQueriesByDate = async ({
  dateRange,
}: {
  dateRange: DateRange;
}): Promise<SlowQuery[]> => {
  // 일자별 요청을 병렬로 실행하되, 동시 요청 수는 제한 (DAILY_FETCH_CONCURRENCY 참고)
  const ymds = Array.from(loopDays(dateRange.from!, dateRange.to!), (date) =>
    format(date, "yyyyMMdd"),
  );
  const dailySlowQueries = await mapWithConcurrency(
    ymds,
    DAILY_FETCH_CONCURRENCY,
    (ymd) => fetchSlowQueries({ ymd }),
  );
  const slowQueries = dailySlowQueries.flat();
  slowQueries.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
  return slowQueries;
};
