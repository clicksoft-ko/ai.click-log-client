import { useEffect, useRef, useState } from "react";

interface HasScrollArgs {
  deps?: unknown[];
}

const useHasScroll = ({ deps }: HasScrollArgs = {}) => {
  const [hasScroll, setHasScroll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (ref.current) {
        setHasScroll(ref.current.scrollHeight > ref.current.clientHeight);
      }
    };

    // ResizeObserver로 요소의 크기 변화 감지
    const resizeObserver = new ResizeObserver(checkScroll);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // 초기 스크롤 여부 체크
    checkScroll();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [...(deps ?? []), ref]);

  return { ref, hasScroll };
};

export { useHasScroll };
