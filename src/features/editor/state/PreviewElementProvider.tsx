import { useCallback, useMemo, useRef, type ReactNode } from "react";
import {
  PreviewElementContext,
  type PreviewElementContextValue,
} from "@/features/editor/state/PreviewElementContext";

export function PreviewElementProvider({ children }: { children: ReactNode }) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useCallback((node: HTMLDivElement | null) => {
    elementRef.current = node;
  }, []);
  const getPreviewElement = useCallback(() => elementRef.current, []);
  const value = useMemo<PreviewElementContextValue>(
    () => ({ previewRef, getPreviewElement }),
    [getPreviewElement, previewRef],
  );

  return (
    <PreviewElementContext.Provider value={value}>
      {children}
    </PreviewElementContext.Provider>
  );
}
