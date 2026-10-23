export interface ErrorLog {
  id: string;
  createdAt: Date;
  moduleName: string;
  logLevel: string;
  exceptionType: string;
  errorMessage: string;
  hospitalName: string;
  computerName: string;
  ykiho: string;
  source: string;
  additionalData: string;
  clientVersion: string;
  stackTrace: string;
}

/** 전체 로그 표의 행. repeatCount 는 연달아 난 같은 오류를 접었을 때의 건수 */
export type ErrorLogRow = ErrorLog & { repeatCount?: number };
