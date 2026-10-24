import { Skeleton } from "./loading";

// 행마다 길이를 조금씩 달리해 실제 목록처럼 보이게 한다
const TITLE_WIDTHS = ["58%", "44%", "66%", "50%", "38%", "61%"];
const META_WIDTHS = ["32%", "26%", "38%", "22%", "30%", "35%"];

/** 묶음 목록이 들어올 자리 */
export const SkeletonRows = ({ rows = 8 }: { rows?: number }) => (
  <ul aria-hidden>
    {Array.from({ length: rows }, (_, i) => (
      <li
        key={i}
        className="flex items-center gap-4 border-b border-line-soft px-4 py-3 last:border-b-0"
      >
        <Skeleton className="h-5 w-14 rounded-full" />
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3.5" width={TITLE_WIDTHS[i % 6]} />
          <Skeleton className="h-3" width={META_WIDTHS[i % 6]} />
        </span>
        <Skeleton className="h-4 w-10" />
      </li>
    ))}
  </ul>
);
