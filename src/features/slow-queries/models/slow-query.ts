export interface SlowQuery {
  id: number;
  ykiho: string;
  computerName: string;
  assemblyName: string;
  className: string;
  methodName: string;
  queryString: string;
  executionSeconds: number;
  createdAt: Date;
  /** 클라이언트 버전 (예전 기록에는 없을 수 있다) */
  ver?: string;
}
