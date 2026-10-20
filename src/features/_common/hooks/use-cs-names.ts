import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiPaths } from "@/shared/paths/paths";
import { fetchCsNames } from "..";

export const useCsNames = () => {
  const { data, ...props } = useQuery({
    queryKey: [apiPaths.cpm.csNames],
    queryFn: fetchCsNames,
  });
  const csNameMap = useMemo(
    () =>
      new Map((data?.data || []).map((csName) => [csName.code, csName.myung])),
    [data],
  );

  return { data, csNameMap, ...props };
};
