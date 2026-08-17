import { lazy, Suspense, useEffect, useState } from "react";
import { Redo2, RotateCcw, Share2, Settings, Undo2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { isCustomIconValue } from "@/features/editor/lib/iconTypes";
import { createShareUrl } from "@/features/editor/lib/share";

import { IconController } from "@/features/editor/components/IconController";
import { ExportDialog } from "@/features/editor/components/ExportDialog";
import { PresetDialog } from "@/features/editor/components/PresetDialog";

const BackgroundController = lazy(() =>
  import("@/features/editor/components/BackgroundController").then(
    (module) => ({
      default: module.BackgroundController,
    }),
  ),
);

interface HeaderProps {
  selectedIndex: number;
}

export const Header = ({ selectedIndex }: HeaderProps) => {
  const { storageValue, undo, redo, reset, canUndo, canRedo, isDefault } =
    useStorage();
  const [shareState, setShareState] = useState<"idle" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "z"
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };

    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [redo, undo]);

  const copyShareLink = async () => {
    const url = createShareUrl(storageValue, window.location);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareState("success");
    } catch (error) {
      console.error("Could not copy share link", error);
      setShareState("error");
    }
    window.setTimeout(() => setShareState("idle"), 2_000);
  };

  return (
    <header className="sticky top-0 z-10 flex h-14.25 items-center gap-1 border-b bg-background px-4">
      <h1 className="text-xl font-semibold">Icon Maker</h1>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the settings for the icon and background
            </DrawerDescription>
          </DrawerHeader>
          {selectedIndex === 0 ? (
            <IconController />
          ) : (
            <Suspense fallback={null}>
              <BackgroundController />
            </Suspense>
          )}
        </DrawerContent>
      </Drawer>
      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Undo"
          title="Undo (⌘Z)"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Redo"
          title="Redo (⇧⌘Z)"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2"
          aria-label="Reset settings"
          title="Reset settings"
          disabled={isDefault}
          onClick={reset}
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <PresetDialog />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2"
          title={
            isCustomIconValue(storageValue.icon)
              ? "Uploaded SVG icons stay on this device and cannot be shared"
              : "Copy share link"
          }
          disabled={isCustomIconValue(storageValue.icon)}
          onClick={() => void copyShareLink()}
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">
            {shareState === "success"
              ? "Link copied"
              : shareState === "error"
                ? "Copy failed"
                : "Share"}
          </span>
        </Button>
        <ExportDialog />
      </div>
      <span role="status" className="sr-only" aria-live="polite">
        {shareState === "success"
          ? "Share link copied"
          : shareState === "error"
            ? "Could not copy the share link"
            : ""}
      </span>
    </header>
  );
};
