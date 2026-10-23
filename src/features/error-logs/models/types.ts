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

/**
 * 전체 로그 표의 행. 연달아 난 같은 오류를 접었으면 repeatCount 는 그 건수,
 * members 는 접힌 로그들(최신순, 자기 자신 포함)
 */
export type ErrorLogRow = ErrorLog & {
  repeatCount?: number;
  members?: ErrorLog[];
};
