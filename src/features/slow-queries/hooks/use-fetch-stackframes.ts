import { useQuery } from "@tanstack/react-query";
import { fetchStackFrames } from "../api/fetch-stack-frames";
import { apiPaths } from "@/shared/paths";

export const useFetchStackFrames = (slowQueryId: number, isOpen: boolean) => {
  const { data: frames, isError } = useQuery({
    queryKey: [apiPaths.click.slowQueryStackFrames(slowQueryId)],
    queryFn: () => fetchStackFrames({ id: slowQueryId }),
    enabled: isOpen,
  });

  return { frames, isError };
};
