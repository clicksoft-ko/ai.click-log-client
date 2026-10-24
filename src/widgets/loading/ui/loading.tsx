import { cn } from "@/shared/utils";

/** 진행률을 알 수 없는 얇은 막대. 화면을 가리지 않고 무언가 오고 있음을 알린다 */
export const LoadingBar = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn("h-0.5 overflow-hidden bg-navy/10", className)}
  >
    <div className="h-full w-2/5 bg-navy motion-safe:animate-loading-bar motion-reduce:w-full motion-reduce:opacity-40" />
  </div>
);

/** 내용이 들어올 자리를 미리 잡아 두는 회색 막대 */
export const Skeleton = ({
  className,
  width,
  height,
}: {
  className?: string;
  width?: string;
  height?: string;
}) => (
  <span
    aria-hidden
    style={{ width, height }}
    className={cn(
      "relative block overflow-hidden rounded bg-ground",
      className,
    )}
  >
    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent motion-safe:animate-shimmer" />
  </span>
);

/** 화면 전체를 기다릴 때 (로그인 확인 등): 맨 위 막대만 보인다 */
export const Loading = () => (
  <div role="status" className="fixed inset-x-0 top-0 z-50">
    <LoadingBar />
    <span className="sr-only">불러오는 중입니다.</span>
  </div>
);
