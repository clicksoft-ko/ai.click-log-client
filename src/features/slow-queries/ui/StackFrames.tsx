import { isAppCode } from "@/shared/constants/framework";
import { CopyButton } from "@/widgets/buttons";
import { Fragment, useState } from "react";
import { useFetchStackFrames } from "../hooks/use-fetch-stackframes";
import { SlowQueryStackFrame } from "../models/slow-query-stack-frame";

interface StackFramesProps {
  slowQueryId: number;
  isOpen: boolean;
}

type FrameRow =
  | { kind: "frame"; no: number; frame: SlowQueryStackFrame }
  | { kind: "libraries"; from: number; count: number };

const isAppFrame = (frame: SlowQueryStackFrame) =>
  isAppCode(`${frame.assemblyName}.${frame.className}`);

/** 우리 코드 프레임은 그대로, 사이에 낀 외부 라이브러리 프레임은 한 줄로 접는다 */
const toRows = (frames: SlowQueryStackFrame[], showLibraries: boolean) => {
  const rows: FrameRow[] = [];
  frames.forEach((frame, index) => {
    const last = rows[rows.length - 1];
    if (!showLibraries && !isAppFrame(frame)) {
      if (last?.kind === "libraries") last.count += 1;
      else rows.push({ kind: "libraries", from: index + 1, count: 1 });
      return;
    }
    rows.push({ kind: "frame", no: index + 1, frame });
  });
  return rows;
};

/**
 * 쿼리를 실행한 함수부터 그 함수를 부른 함수 순서의 호출 경로.
 * 우리 프로그램 함수를 바로 찾을 수 있게 강조하고, 이름을 복사할 수 있게 한다
 */
export const StackFrames = ({ slowQueryId, isOpen }: StackFramesProps) => {
  const { frames, isError } = useFetchStackFrames(slowQueryId, isOpen);
  const [showLibraries, setShowLibraries] = useState(false);

  if (!isOpen) return null;
  if (isError) {
    return (
      <p className="text-xs text-crit">
        호출 경로를 불러오지 못했습니다. 창을 닫았다가 다시 열어 보세요.
      </p>
    );
  }
  if (!frames) {
    return <p className="text-xs text-ink-3">호출 경로를 불러오는 중입니다.</p>;
  }
  if (frames.length === 0) {
    return (
      <p className="text-xs text-ink-3">호출 경로가 기록되지 않았습니다.</p>
    );
  }

  const appCount = frames.filter(isAppFrame).length;
  const libraryCount = frames.length - appCount;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-ink-2">
          우리 코드 <b className="font-semibold text-ink">{appCount}</b>개
          {libraryCount > 0 && <>, 외부 라이브러리 {libraryCount}개</>}
        </span>
        {libraryCount > 0 && (
          <button
            onClick={() => setShowLibraries((value) => !value)}
            className="text-xs text-ink-2 underline-offset-2 hover:text-ink hover:underline"
          >
            {showLibraries ? "외부 라이브러리 접기" : "외부 라이브러리 펼치기"}
          </button>
        )}
      </div>
      <ol className="flex flex-col">
        {toRows(frames, showLibraries).map((row) => (
          <Fragment key={row.kind === "frame" ? `f${row.no}` : `l${row.from}`}>
            {row.kind === "libraries" ? (
              <li>
                <button
                  onClick={() => setShowLibraries(true)}
                  className="w-full border-b border-line-soft py-1.5 pl-[26px] text-left text-xs text-ink-3 hover:text-ink"
                >
                  외부 라이브러리 {row.count}개
                </button>
              </li>
            ) : (
              <FrameItem
                no={row.no}
                frame={row.frame}
                isApp={isAppFrame(row.frame)}
              />
            )}
          </Fragment>
        ))}
      </ol>
      <p className="text-xs leading-relaxed text-ink-3">
        위에서부터 쿼리를 실행한 함수, 그 함수를 부른 함수 순서입니다.
      </p>
    </div>
  );
};

const FrameItem = ({
  no,
  frame,
  isApp,
}: {
  no: number;
  frame: SlowQueryStackFrame;
  isApp: boolean;
}) => {
  const name = `${frame.className}.${frame.methodName}`;
  return (
    <li className="group grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-2 border-b border-line-soft py-[7px]">
      <span className="pt-px text-[11.5px] tabular-nums text-ink-3">{no}</span>
      <span className="flex min-w-0 flex-col font-mono text-xs leading-[1.4]">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-ink-3">{frame.assemblyName}</span>
          {no === 1 && (
            <span className="shrink-0 rounded bg-navy px-1.5 font-sans text-[10.5px] font-medium text-white">
              쿼리 실행
            </span>
          )}
        </span>
        <span
          className={
            isApp ? "break-all font-medium text-ink" : "break-all text-ink-3"
          }
        >
          {name}
          {frame.lineNumber > 0 && (
            <span className="ml-1 font-normal text-ink-3">
              :{frame.lineNumber}
            </span>
          )}
        </span>
      </span>
      {isApp && (
        <CopyButton
          copyText={name}
          label={`${name} 복사`}
          iconSize={13}
          className="static rounded bg-transparent p-1 text-ink-3 opacity-0 hover:bg-ground hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
        />
      )}
    </li>
  );
};
