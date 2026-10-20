import { axiosClient } from "@/shared/api";
import { apiPaths } from "@/shared/paths";
import { DAILY_FETCH_CONCURRENCY } from "@/shared/constants/fetch";
import { loopDays, mapWithConcurrency } from "@/shared/utilities";
import { addDays, compareDesc, startOfDay } from "date-fns";
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
  // end 는 포함하지 않으므로(반열림 구간) 그 직전 시각이 속한 날까지만 돈다
  const lastDay = new Date(end.getTime() - 1);
  const days = Array.from(loopDays(start, lastDay), (date) => new Date(date));
  const dailyLogs = await mapWithConcurrency(
    days,
    DAILY_FETCH_CONCURRENCY,
    (date) => {
      // 서버는 endDate 를 포함하지 않으므로(반열림 구간) 다음 날 0시를 끝으로 보내 하루 경계에 빈틈이 없게 한다
      const dayEnd = startOfDay(addDays(date, 1));

      return fetchErrorLogs({
        startDate: startOfDay(date).toISOString(),
        endDate: dayEnd > end ? endDate : dayEnd.toISOString(),
      });
    },
  );

  const logs = dailyLogs.flat();
  logs.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
  return logs;
};
