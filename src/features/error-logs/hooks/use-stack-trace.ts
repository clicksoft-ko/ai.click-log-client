import { useQuery } from "@tanstack/react-query";
import { fetchStacktrace } from "../api/fetch-stacktrace";
import { apiPaths } from "@/shared/paths";

export const useStackTrace = (id: string) => {
  const { data, ...props } = useQuery({
    queryKey: [apiPaths.click.stacktrace(id)],
    queryFn: () => fetchStacktrace(id),
  });
  return { stackTrace: data?.stackTrace, ...props };
};
