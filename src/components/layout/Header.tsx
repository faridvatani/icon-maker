import { Redo2, RotateCcw, Share2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { isCustomIconValue } from "@/features/editor/lib/iconTypes";
import {
  dispatchEditorEvent,
  editorEvent,
} from "@/features/editor/lib/editorEvents";
import { useShareLink } from "@/features/editor/hooks/useShareLink";
import {
  ExportDialog,
  QuickExportButton,
} from "@/features/editor/components/ExportDialog";
import { PresetDialog } from "@/features/editor/components/PresetDialog";
import { BrandKitDialog } from "@/features/editor/components/BrandKitDialog";
import { KeyboardShortcutsDialog } from "@/features/editor/components/KeyboardShortcutsDialog";

export const Header = () => {
  const { storageValue, undo, redo, canUndo, canRedo, isDefault } =
    useStorage();
  const { copyShareLink, shareState } = useShareLink();
  return (
    <header className="sticky top-0 z-10 flex h-14.25 items-center border-b bg-background/95 px-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Icon Maker
        </h1>
        <p className="hidden text-xs text-muted-foreground lg:block">
          A local studio for crisp square assets
        </p>
      </div>
      <div className="ml-auto hidden items-center gap-1 md:flex">
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
          onClick={(event) =>
            dispatchEditorEvent(editorEvent.confirmReset, event.currentTarget)
          }
        >
          <RotateCcw className="size-4" />
          <span className="hidden lg:inline">Reset</span>
        </Button>
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
          <span className="hidden lg:inline">
            {shareState === "success"
              ? "Link copied"
              : shareState === "error"
                ? "Copy failed"
                : "Share"}
          </span>
        </Button>
        <QuickExportButton />
        <ExportDialog />
      </div>
      <PresetDialog showTrigger={false} />
      <BrandKitDialog showTrigger={false} />
      <KeyboardShortcutsDialog showTrigger={false} />
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
