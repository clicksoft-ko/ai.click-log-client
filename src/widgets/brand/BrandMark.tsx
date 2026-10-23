import { cn } from "@/shared/utils";

/** 남색 칸 위의 맥박선. 사이드바·로그인 화면 로고 */
export const BrandMark = ({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    aria-hidden
    className={cn("shrink-0", className)}
  >
    <rect width="28" height="28" rx="7" className="fill-navy-2" />
    <path
      d="M5 15h4l2.5-6 4 11 2.5-5H23"
      fill="none"
      stroke="#EE8A7E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
