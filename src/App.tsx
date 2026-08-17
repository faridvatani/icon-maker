import { lazy, Suspense, useEffect, useState } from "react";
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

const BackgroundController = lazy(() =>
  import("@/features/editor/components/BackgroundController").then(
    (module) => ({
      default: module.BackgroundController,
    }),
  ),
);

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

function App() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  return (
    <StorageProvider>
      <SharedDesignLoader />
      <div className="grid h-screen w-full pl-14 antialiased">
        <Sidebar value={selectedIndex} onValueChange={setSelectedIndex} />
        <div className="flex flex-col">
          <Header selectedIndex={selectedIndex} />
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <section className="relative hidden flex-col items-start gap-8 md:flex">
              {selectedIndex === 0 ? (
                <IconController />
              ) : (
                <Suspense fallback={null}>
                  <BackgroundController />
                </Suspense>
              )}
            </section>
            <section className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
              <Badge variant="outline" className="absolute right-3 top-3">
                Output
              </Badge>
              <div className="flex-1">
                <LogoPreview />
              </div>
            </section>
          </main>
        </div>
      </div>
    </StorageProvider>
  );
}

export default App;
