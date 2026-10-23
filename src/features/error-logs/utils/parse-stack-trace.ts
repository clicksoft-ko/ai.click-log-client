import { isAppCode } from "@/shared/constants/framework";

export interface StackFrame {
  kind: "frame";
  /** 스택 안에서의 프레임 순번 (1부터) */
  no: number;
  /** 메서드 앞까지의 경로 (예: "cspCommonForm.frmCommonForm.") */
  ns: string;
  method: string;
  /** 괄호를 포함한 인자 목록 (예: "(String gubun)") */
  args: string;
  /** "파일 경로:줄 N" 정보가 있을 때만 채워진다 */
  location?: string;
  /** System·Microsoft 등 프레임워크가 아닌 우리 코드 프레임 */
  isApp: boolean;
}

export interface StackText {
  kind: "text";
  text: string;
}

export type StackLine = StackFrame | StackText;

// .NET 스택 한 줄: "위치: 시그니처 [파일 경로:줄 N]" (영문 런타임은 "at 시그니처 [in 경로:line N]")
const FRAME_PATTERN =
  /^\s*(?:위치:|at)\s+(.+?)(?:\s+(?:파일|in)\s+(.+):(?:줄|line)\s+(\d+))?\s*$/;
const SIGNATURE_PATTERN = /^(.*\.)([^.(]+)(\(.*\))$/;

export const parseStackTrace = (stackTrace: string): StackLine[] => {
  let no = 0;

  return stackTrace
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line): StackLine => {
      const frame = line.match(FRAME_PATTERN);
      if (!frame) return { kind: "text", text: line.trim() };

      const [, signature, file, lineNumber] = frame;
      const parts = signature.match(SIGNATURE_PATTERN);
      no += 1;

      return {
        kind: "frame",
        no,
        ns: parts ? parts[1] : "",
        method: parts ? parts[2] : signature,
        args: parts ? parts[3] : "",
        location: file ? `${file}:${lineNumber}` : undefined,
        isApp: isAppCode(signature),
      };
    });
};

/**
 * 호출 흐름에 보여줄 "클래스.메서드" 이름.
 * 컴파일러가 만든 async 상태 머신·람다 클래스·생성자는 원래 이름으로 바꾼다.
 */
export const frameLabel = (frame: StackFrame) => {
  // 생성자 안 람다의 "<.ctor>" 점이 경로 구분으로 잘리지 않도록 먼저 "<ctor>" 로 바꾼 뒤 나눈다
  const segments = `${frame.ns}${frame.method}`
    .replace(/<\.(c?ctor)>/g, "<$1>")
    .split(".")
    .filter(Boolean);
  let method = segments.pop() ?? "";
  let className = segments.pop() ?? "";

  // async 메서드: Ns.Form.<SaveAsync>d__5.MoveNext() → Form.SaveAsync
  // (async 람다·로컬 함수의 상태 머신은 "<...>d" 처럼 번호가 붙지 않는다)
  const asyncMatch = className.match(/^<(.+)>d(?:__\d+)?$/);
  if (asyncMatch && method === "MoveNext") {
    method = asyncMatch[1];
    className = segments.pop() ?? "";
  }
  // 람다를 담는 컴파일러 생성 클래스(<>c, <>c__DisplayClass5_0)는 바깥 클래스로 대신한다
  if (className.startsWith("<>")) className = segments.pop() ?? "";
  // 람다: <btnSave_Click>b__0_0 → btnSave_Click, 로컬 함수: <Load>g__Init|0_0 → Init
  method =
    method.match(/^<(.+)>b__\w+$/)?.[1] ??
    method.match(/^<.+>g__(.+)\|[\w]+$/)?.[1] ??
    method;

  // 생성자: Ns.Form..ctor() → "new Form"
  if (method === "ctor" || method === "cctor") return `new ${className}`;
  return className ? `${className}.${method}` : method;
};
