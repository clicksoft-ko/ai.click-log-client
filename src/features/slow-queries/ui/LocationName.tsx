/** 위치: 어셈블리는 흐리게, 우리 함수(클래스.메서드)는 진하게 */
export const LocationName = ({
  assemblyName,
  className,
  methodName,
}: {
  assemblyName: string;
  className: string;
  methodName: string;
}) => (
  <span className="flex min-w-0 flex-col font-mono text-xs leading-[1.35]">
    <span className="truncate text-ink-3">{assemblyName}</span>
    <span className="truncate">
      <span className="text-ink-2">{className}.</span>
      <span className="font-medium text-ink">{methodName}</span>
    </span>
  </span>
);
