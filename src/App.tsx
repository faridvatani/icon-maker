import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  StorageProvider,
  useStorage,
} from "@/features/editor/state/EditorSettingsContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";

import { IconController } from "@/features/editor/components/IconController";
import { LogoPreview } from "@/features/editor/components/LogoPreview";
import { defaultEditorSettings } from "@/features/editor/lib/editorSettings";
import { parseSharedSettings } from "@/features/editor/lib/share";
import { MobileEditorControls } from "@/features/editor/components/MobileEditorControls";
import { BackgroundController } from "@/features/editor/components/BackgroundController";
import { ResetSettingsDialog } from "@/features/editor/components/ResetSettingsDialog";
import {
  dispatchEditorEvent,
  editorEvent,
} from "@/features/editor/lib/editorEvents";
import { PreviewElementProvider } from "@/features/editor/state/PreviewElementProvider";

const OPEN_MODAL_SELECTOR =
  "[role='dialog'][data-state='open'], [role='alertdialog'][data-state='open']";
const EDITABLE_CONTROL_SELECTOR =
  "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox'], [role='searchbox'], [role='combobox'], [role='spinbutton']";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest(EDITABLE_CONTROL_SELECTOR));

function SharedDesignLoader() {
  const { applySettings } = useStorage();
  const hasSharedDesign = new URLSearchParams(window.location.search).has(
    "design",
  );
  const [sharedDesign] = useState(() => {
    return hasSharedDesign
      ? parseSharedSettings(window.location.search)
      : undefined;
  });

  useEffect(() => {
    if (sharedDesign) {
      applySettings(sharedDesign);
    } else if (hasSharedDesign) {
      applySettings(defaultEditorSettings);
    }
  }, [applySettings, hasSharedDesign, sharedDesign]);

  const message = sharedDesign
    ? "Shared design loaded. You can undo this change."
    : hasSharedDesign
      ? "This shared design could not be loaded."
      : "";

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border bg-background px-4 py-2 text-sm shadow-lg"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EditorShell() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const { undo, redo } = useStorage();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        isEditableTarget(event.target) ||
        document.querySelector(OPEN_MODAL_SELECTOR)
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && key === "x") {
        event.preventDefault();
        dispatchEditorEvent(editorEvent.confirmReset);
        return;
      }
      if (key === "?" || (event.shiftKey && key === "/"))
        dispatchEditorEvent(editorEvent.openShortcuts);
      if (key === "e") dispatchEditorEvent(editorEvent.openExport);
      if (key === "i" || key === "b") {
        const panel = key === "i" ? 0 : 1;
        setSelectedIndex(panel);
        setMobileControlsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  return (
    <>
      <a
        href="#editor-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to editor
      </a>
      <SharedDesignLoader />
      <div className="min-h-dvh w-full pb-16 antialiased md:h-dvh md:overflow-hidden md:pl-14 md:pb-0">
        <Sidebar value={selectedIndex} onValueChange={setSelectedIndex} />
        <div className="flex min-h-0 flex-col md:h-full">
          <Header />
          <main
            id="editor-main"
            tabIndex={-1}
            className="flex flex-1 scroll-mt-16 gap-4 overflow-auto p-4 md:min-h-0 md:overflow-hidden"
          >
            <section className="relative hidden min-h-0 flex-col items-start gap-8 md:flex md:h-full md:w-1/2 md:shrink-0 md:overflow-y-auto md:overscroll-contain md:pr-2 lg:w-1/3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-full"
                >
                  {selectedIndex === 0 ? (
                    <IconController />
                  ) : (
                    <BackgroundController />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
            <section className="relative flex min-h-[50vh] flex-col overflow-hidden rounded-xl border bg-muted/40 p-4 md:h-full md:min-h-0 md:flex-1">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="text-sm font-semibold">Live preview</h2>
                  <p className="text-xs text-muted-foreground">
                    Your square asset updates as you work.
                  </p>
                </div>
                <Badge variant="outline">1024 px master</Badge>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
                className="artboard-grid mt-4 flex-1 rounded-lg border border-dashed p-3 sm:p-6"
              >
                <LogoPreview />
              </motion.div>
            </section>
          </main>
        </div>
      </div>
      <MobileEditorControls
        activePanel={selectedIndex}
        onPanelChange={setSelectedIndex}
        open={mobileControlsOpen}
        onOpenChange={setMobileControlsOpen}
      />
      <ResetSettingsDialog />
    </>
  );
}

function App() {
  return (
    <StorageProvider>
      <PreviewElementProvider>
        <EditorShell />
      </PreviewElementProvider>
    </StorageProvider>
  );
}

export default App;
