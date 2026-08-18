export type StorageReadFailure =
  "unavailable" | "missing" | "malformed" | "read-failed";

export type StorageReadResult =
  | { ok: true; key: string; value: unknown }
  | { ok: false; reason: StorageReadFailure };

export type StorageWriteFailure =
  "unavailable" | "serialization-failed" | "quota-exceeded" | "write-failed";

export type StorageWriteResult =
  { ok: true } | { ok: false; reason: StorageWriteFailure };

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

export const readJson = (key: string): StorageReadResult => {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, reason: "unavailable" };

  let serialized: string | null;
  try {
    serialized = storage.getItem(key);
  } catch {
    return { ok: false, reason: "read-failed" };
  }
  if (serialized === null) return { ok: false, reason: "missing" };

  try {
    return { ok: true, key, value: JSON.parse(serialized) as unknown };
  } catch {
    return { ok: false, reason: "malformed" };
  }
};

export const readFirstJson = (keys: readonly string[]): StorageReadResult => {
  let failure: StorageReadResult = { ok: false, reason: "missing" };
  for (const key of keys) {
    const result = readJson(key);
    if (result.ok) return result;
    if (result.reason !== "missing") failure = result;
  }
  return failure;
};

const isQuotaExceeded = (error: unknown) =>
  error instanceof DOMException &&
  (error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED");

export const writeJson = (key: string, value: unknown): StorageWriteResult => {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, reason: "unavailable" };

  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return { ok: false, reason: "serialization-failed" };
  }
  if (serialized === undefined) {
    return { ok: false, reason: "serialization-failed" };
  }

  try {
    storage.setItem(key, serialized);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: isQuotaExceeded(error) ? "quota-exceeded" : "write-failed",
    };
  }
};
