import { createContext, useContext } from "react";

export interface PreviewElementContextValue {
  previewRef: (node: HTMLDivElement | null) => void;
  getPreviewElement: () => HTMLDivElement | null;
}

export const PreviewElementContext = createContext<
  PreviewElementContextValue | undefined
>(undefined);

export function usePreviewElement(): PreviewElementContextValue {
  const context = useContext(PreviewElementContext);
  if (!context) {
    throw new Error(
      "usePreviewElement must be used within a PreviewElementProvider",
    );
  }
  return context;
}
