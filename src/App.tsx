import { useEffect, useState } from "react";
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

  return message ? (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border bg-background px-4 py-2 text-sm shadow-lg"
    >
      {message}
    </div>
  ) : null;
}

function EditorShell() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const { undo, redo, reset } = useStorage();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        document.querySelector("[role='dialog'][data-state='open']")
      )
        return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && key === "x") {
        event.preventDefault();
        if (
          window.confirm("Reset all editor settings? You can undo this change.")
        )
          reset();
        return;
      }
      if (key === "?" || (event.shiftKey && key === "/"))
        window.dispatchEvent(new Event("icon-maker:open-shortcuts"));
      if (key === "e")
        window.dispatchEvent(new Event("icon-maker:open-export"));
      if (key === "i" || key === "b") {
        const panel = key === "i" ? 0 : 1;
        setSelectedIndex(panel);
        setMobileControlsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, reset, undo]);

  return (
    <>
      <SharedDesignLoader />
      <div className="grid min-h-dvh w-full pb-16 antialiased md:h-screen md:grid-rows-[minmax(0,1fr)] md:pl-14 md:pb-0">
        <div className="hidden md:block">
          <Sidebar value={selectedIndex} onValueChange={setSelectedIndex} />
        </div>
        <div className="flex min-h-0 flex-col">
          <Header />
          <main className="flex flex-1 gap-4 overflow-auto p-4 md:h-[calc(100dvh-3.5625rem)] md:flex-none md:min-h-0 md:overflow-hidden">
            <section className="relative hidden min-h-0 flex-col items-start gap-8 md:flex md:h-full md:w-1/2 md:shrink-0 md:overflow-y-auto md:overscroll-contain md:pr-2 lg:w-1/3">
              {selectedIndex === 0 ? (
                <IconController />
              ) : (
                <BackgroundController />
              )}
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
              <div className="artboard-grid mt-4 flex-1 rounded-lg border border-dashed p-3 sm:p-6">
                <LogoPreview />
              </div>
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
    </>
  );
}

function App() {
  return (
    <StorageProvider>
      <EditorShell />
    </StorageProvider>
  );
}

export default App;
