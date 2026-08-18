// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  readFirstJson,
  readJson,
  writeJson,
} from "@/features/editor/lib/safeStorage";

const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);

const installStorage = (overrides: Partial<Storage> = {}) => {
  const values = new Map<string, string>();
  const storage = {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
    ...overrides,
  } satisfies Storage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  return storage;
};

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

describe("safeStorage", () => {
  it("round trips JSON without exposing parsing to callers", () => {
    installStorage();

    expect(writeJson("settings", { version: 4 })).toEqual({ ok: true });
    expect(readJson("settings")).toEqual({
      ok: true,
      key: "settings",
      value: { version: 4 },
    });
  });

  it("reports malformed data and can fall back to an older key", () => {
    const storage = installStorage();
    storage.setItem("current", "{not-json");
    storage.setItem("previous", JSON.stringify({ version: 3 }));

    expect(readJson("current")).toEqual({
      ok: false,
      reason: "malformed",
    });
    expect(readFirstJson(["current", "previous"])).toEqual({
      ok: true,
      key: "previous",
      value: { version: 3 },
    });
  });

  it("handles unavailable storage without throwing", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });

    expect(readJson("settings")).toEqual({
      ok: false,
      reason: "unavailable",
    });
    expect(writeJson("settings", {})).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });

  it("distinguishes quota failures from other write failures", () => {
    installStorage({
      setItem: () => {
        throw new DOMException("Full", "QuotaExceededError");
      },
    });
    expect(writeJson("settings", {})).toEqual({
      ok: false,
      reason: "quota-exceeded",
    });

    installStorage({
      setItem: () => {
        throw new Error("Disk failure");
      },
    });
    expect(writeJson("settings", {})).toEqual({
      ok: false,
      reason: "write-failed",
    });
  });

  it("reports values that cannot be serialized", () => {
    installStorage();
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(writeJson("settings", circular)).toEqual({
      ok: false,
      reason: "serialization-failed",
    });
  });
});
