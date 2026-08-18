import { readJson, writeJson, type StorageWriteResult } from "./safeStorage";

type RecordNormalizer<T> = (value: unknown) => T | null;

export const normalizeSavedName = (name: string, fallback: string) =>
  name.trim().replace(/\s+/g, " ").slice(0, 48) || fallback;

const normalizeCollection = <T>(
  value: unknown,
  normalizeRecord: RecordNormalizer<T>,
  limit: number,
): T[] => {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((record): T[] => {
      const normalized = normalizeRecord(record);
      return normalized ? [normalized] : [];
    })
    .slice(0, limit);
};

export const readSavedCollection = <T>(
  key: string,
  normalizeRecord: RecordNormalizer<T>,
  limit: number,
): T[] => {
  const result = readJson(key);
  return result.ok
    ? normalizeCollection(result.value, normalizeRecord, limit)
    : [];
};

export const writeSavedCollection = <T>(
  key: string,
  records: readonly T[],
  normalizeRecord: RecordNormalizer<T>,
  limit: number,
): StorageWriteResult =>
  writeJson(key, normalizeCollection(records, normalizeRecord, limit));
