import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContrastAdvisor } from "@/features/editor/components/ContrastAdvisor";
import { usePreviewElement } from "@/features/editor/state/PreviewElementContext";
import { PreviewElementProvider } from "@/features/editor/state/PreviewElementProvider";
import type { ContrastResult } from "@/features/editor/lib/contrast";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { samplePreviewContrast } = vi.hoisted(() => ({
  samplePreviewContrast: vi.fn(),
}));

vi.mock("@/features/editor/lib/contrastSampling", () => ({
  samplePreviewContrast,
}));

const result = (currentRatio: number): ContrastResult => ({
  ratio: currentRatio,
  currentRatio,
  suggestedColor: "#000000",
  suggestions: ["#000000", "#ffffff"],
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
};

function PreviewStub() {
  const { previewRef } = usePreviewElement();
  return <div ref={previewRef} />;
}

function TestView({ fingerprint }: { fingerprint: string }) {
  return (
    <PreviewElementProvider>
      <PreviewStub />
      <ContrastAdvisor
        fingerprint={fingerprint}
        currentColor="#123456"
        onApply={() => undefined}
      />
    </PreviewElementProvider>
  );
}

describe("ContrastAdvisor", () => {
  let container: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    samplePreviewContrast.mockReset();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("calculates and displays the initial result", async () => {
    samplePreviewContrast.mockResolvedValue(result(7.25));

    await act(async () => root?.render(<TestView fingerprint="initial" />));
    await act(async () => vi.advanceTimersByTimeAsync(300));

    expect(container.textContent).toContain("7.25:1 worst-case");
  });

  it("never lets an obsolete calculation overwrite newer settings", async () => {
    const older = deferred<ContrastResult>();
    const newer = deferred<ContrastResult>();
    samplePreviewContrast
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);

    await act(async () => root?.render(<TestView fingerprint="older" />));
    await act(async () => vi.advanceTimersByTimeAsync(300));
    await act(async () => root?.render(<TestView fingerprint="newer" />));
    await act(async () => vi.advanceTimersByTimeAsync(300));
    await act(async () => newer.resolve(result(8.5)));
    expect(container.textContent).toContain("8.50:1 worst-case");

    await act(async () => older.resolve(result(1.1)));
    expect(container.textContent).toContain("8.50:1 worst-case");
    expect(container.textContent).not.toContain("1.10:1 worst-case");
  });

  it("clears an obsolete result while settings are recalculated", async () => {
    samplePreviewContrast.mockResolvedValueOnce(result(6.25));

    await act(async () => root?.render(<TestView fingerprint="first" />));
    await act(async () => vi.advanceTimersByTimeAsync(300));
    expect(container.textContent).toContain("6.25:1 worst-case");

    samplePreviewContrast.mockReturnValueOnce(new Promise(() => undefined));
    await act(async () => root?.render(<TestView fingerprint="second" />));

    expect(container.textContent).not.toContain("6.25:1 worst-case");
  });

  it("does not update or log errors after unmount", async () => {
    const pending = deferred<ContrastResult>();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    samplePreviewContrast.mockReturnValueOnce(pending.promise);

    await act(async () => root?.render(<TestView fingerprint="pending" />));
    await act(async () => vi.advanceTimersByTimeAsync(300));
    act(() => root?.unmount());
    root = undefined;
    await act(async () => pending.resolve(result(9)));

    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
