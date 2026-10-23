import { isToday } from "date-fns";

/** 시간(0~23)별 · 계열별 건수. seriesOf 가 돌려준 번호의 계열에 더한다 */
export const countByHour = <T>(
  items: T[],
  dateOf: (item: T) => Date,
  seriesCount: number,
  seriesOf: (item: T) => number = () => 0,
) => {
  const hours = Array.from({ length: 24 }, () =>
    Array<number>(seriesCount).fill(0),
  );
  for (const item of items) {
    hours[new Date(dateOf(item)).getHours()][seriesOf(item)] += 1;
  }
  return hours;
};

/** 오늘 하루만 조회했으면, 아직 오지 않은 다음 시간부터 점선으로 그린다 */
export const futureHourFrom = (range: { from?: Date; to?: Date }) =>
  range.from && range.to && isToday(range.from) && isToday(range.to)
    ? new Date().getHours() + 1
    : undefined;
