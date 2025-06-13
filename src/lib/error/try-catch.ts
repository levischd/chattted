export const tryCatch = async <T, E extends Error = Error>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, E]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
};
