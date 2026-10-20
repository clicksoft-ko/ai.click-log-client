import { axiosClient } from "@/shared/api";
import { apiPaths } from "@/shared/paths";
import { DAILY_FETCH_CONCURRENCY } from "@/shared/constants/fetch";
import { loopDays, mapWithConcurrency } from "@/shared/utilities";
import { compareDesc } from "date-fns";
import { ErrorLog } from "../models/types";

interface FetchErrorLogsParams {
  startDate: string;
  endDate: string;
}

export const fetchErrorLogs = async ({
  startDate,
  endDate,
}: FetchErrorLogsParams): Promise<ErrorLog[]> => {
  const response = await axiosClient.get(apiPaths.click.errorLog, {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};

export const fetchErrorLogsByDate = async ({
  startDate,
  endDate,
}: FetchErrorLogsParams): Promise<ErrorLog[]> => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 일자별 요청을 병렬로 실행하되, 동시 요청 수는 제한 (DAILY_FETCH_CONCURRENCY 참고)
  const days = Array.from(loopDays(start, end), (date) => new Date(date));
  const dailyLogs = await mapWithConcurrency(
    days,
    DAILY_FETCH_CONCURRENCY,
    (date) => {
      const nextDate = new Date(date);
      date.setHours(0, 0, 0);
      nextDate.setHours(23, 59, 59);

      return fetchErrorLogs({
        startDate: date.toISOString(),
        endDate: nextDate > end ? endDate : nextDate.toISOString(),
      });
    },
  );

  const logs = dailyLogs.flat();
  logs.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
  return logs;
};
