/**
 * items를 최대 limit개씩 동시에 처리하고, 입력 순서대로 결과를 반환한다.
 * 하나라도 실패하면 남은 항목은 시작하지 않고 첫 오류로 reject 한다.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  let failed = false;

  const worker = async () => {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await fn(items[index]);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}
