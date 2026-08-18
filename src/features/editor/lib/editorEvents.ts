export const editorEvent = {
  confirmReset: "icon-maker:confirm-reset",
  openBrandKits: "icon-maker:open-brand-kits",
  openExport: "icon-maker:open-export",
  openSavedDesigns: "icon-maker:open-saved-designs",
  openShortcuts: "icon-maker:open-shortcuts",
  quickExport: "icon-maker:quick-export",
} as const;

export type EditorEventName = (typeof editorEvent)[keyof typeof editorEvent];

export function dispatchEditorEvent(
  eventName: EditorEventName,
  returnFocusTarget?: HTMLElement | null,
) {
  const returnFocusTo =
    returnFocusTarget ??
    (document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null);
  window.dispatchEvent(
    new CustomEvent(eventName, { detail: { returnFocusTo } }),
  );
}

export const getEditorEventFocusTarget = (event: Event) => {
  if (!(event instanceof CustomEvent)) return null;
  const target = (event.detail as { returnFocusTo?: unknown } | null)
    ?.returnFocusTo;
  return target instanceof HTMLElement ? target : null;
};
