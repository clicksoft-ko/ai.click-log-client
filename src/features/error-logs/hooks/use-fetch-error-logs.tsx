import { useSearchFilter } from "@/widgets/filters";
import { useMutation } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";
import { useMemo } from "react";
import { fetchErrorLogsByDate } from "../api/fetch-error-logs";

const useFetchErrorLogs = () => {
  const { dateRange, excludedTags } = useSearchFilter();
  const { data, mutate, isPending } = useMutation({
    mutationFn: () => {
      return fetchErrorLogsByDate({
        startDate: dateRange.from
          ? startOfDay(dateRange.from).toISOString()
          : "",
        // 서버는 endDate 를 포함하지 않으므로 다음 날 0시를 보낸다
        endDate: dateRange.to
          ? startOfDay(addDays(dateRange.to, 1)).toISOString()
          : "",
      });
    },
  });

  // 검색 제외 키워드 적용하여 새로운 데이터 생성
  const filteredData = useMemo(() => {
    return (
      data?.filter(
        (log) =>
          !excludedTags.some((tag) =>
            log.errorMessage.toLowerCase().includes(tag.toLowerCase()),
          ),
      ) ?? []
    );
  }, [data, excludedTags]);

  return { data: filteredData, mutate, isPending };
};

export default useFetchErrorLogs;
