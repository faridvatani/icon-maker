import { useEffect, useState } from "react";
import {
  Bookmark,
  Download,
  Ellipsis,
  Image,
  Keyboard,
  Palette,
  PencilRuler,
  Redo2,
  RotateCcw,
  Share2,
  Settings2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconController } from "@/features/editor/components/IconController";
import { BackgroundController } from "@/features/editor/components/BackgroundController";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { isCustomIconValue } from "@/features/editor/lib/iconTypes";
import {
  dispatchEditorEvent,
  editorEvent,
} from "@/features/editor/lib/editorEvents";
import { useShareLink } from "@/features/editor/hooks/useShareLink";

interface MobileEditorControlsProps {
  activePanel: number;
  onPanelChange: (panel: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallAction() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches,
  );
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (!prompt || installed) return null;
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start"
      onClick={() =>
        void (async () => {
          await prompt.prompt();
          const result = await prompt.userChoice;
          if (result.outcome === "accepted") setInstalled(true);
        })()
      }
    >
      Install Icon Maker
    </Button>
  );
}

function MoreControls({ onClose }: { onClose: () => void }) {
  const { storageValue, undo, redo, canUndo, canRedo, isDefault } =
    useStorage();
  const { copyShareLink, shareState } = useShareLink();
  return (
    <div className="grid gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-1"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="size-4" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-1"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="size-4" />
          Redo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-1"
          disabled={isDefault}
          onClick={(event) =>
            dispatchEditorEvent(editorEvent.confirmReset, event.currentTarget)
          }
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-2 px-2 text-sm"
          onClick={(event) =>
            dispatchEditorEvent(
              editorEvent.openSavedDesigns,
              event.currentTarget,
            )
          }
        >
          <Bookmark className="size-4 shrink-0" />
          Saved designs
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-2 px-2 text-sm"
          onClick={(event) =>
            dispatchEditorEvent(editorEvent.openBrandKits, event.currentTarget)
          }
        >
          <Palette className="size-4 shrink-0" />
          Brand kits
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-2 px-2 text-sm"
          onClick={(event) =>
            dispatchEditorEvent(editorEvent.openShortcuts, event.currentTarget)
          }
        >
          <Keyboard className="size-4 shrink-0" />
          Keyboard shortcuts
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-2 px-2 text-sm"
          disabled={isCustomIconValue(storageValue.icon)}
          title={
            isCustomIconValue(storageValue.icon)
              ? "Uploaded SVG icons stay on this device and cannot be shared"
              : undefined
          }
          onClick={() => void copyShareLink()}
        >
          <Share2 className="size-4 shrink-0" />
          {shareState === "success"
            ? "Link copied"
            : shareState === "error"
              ? "Copy failed"
              : "Copy share link"}
        </Button>
      </div>
      <InstallAction />
      <Button type="button" variant="ghost" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

export function MobileEditorControls({
  activePanel,
  onPanelChange,
  open,
  onOpenChange,
}: MobileEditorControlsProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <nav
      aria-label="Mobile editor controls"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
    >
      <Drawer
        open={open && activePanel === 0}
        onOpenChange={(nextOpen) => {
          if (nextOpen) onPanelChange(0);
          onOpenChange(nextOpen);
        }}
      >
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant={activePanel === 0 ? "secondary" : "ghost"}
            className="flex-1 gap-1 px-2"
          >
            <PencilRuler className="size-4" />
            Icon
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[82dvh] overscroll-contain">
          <DrawerHeader>
            <DrawerTitle>Icon controls</DrawerTitle>
            <DrawerDescription>
              Changes update the live preview immediately.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <IconController />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={open && activePanel === 1}
        onOpenChange={(nextOpen) => {
          if (nextOpen) onPanelChange(1);
          onOpenChange(nextOpen);
        }}
      >
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant={activePanel === 1 ? "secondary" : "ghost"}
            className="flex-1 gap-1 px-2"
          >
            <Image className="size-4" />
            Background
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[82dvh] overscroll-contain">
          <DrawerHeader>
            <DrawerTitle>Background controls</DrawerTitle>
            <DrawerDescription>
              Changes update the live preview immediately.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <BackgroundController />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer open={exportOpen} onOpenChange={setExportOpen}>
        <DrawerTrigger asChild>
          <Button type="button" variant="ghost" className="flex-1 gap-1 px-2">
            Export
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[60dvh] overscroll-contain">
          <DrawerHeader>
            <DrawerTitle>Export</DrawerTitle>
            <DrawerDescription>
              Choose a quick PNG or configure a package.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-2 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              className="gap-1.5"
              onClick={(event) =>
                dispatchEditorEvent(
                  editorEvent.quickExport,
                  event.currentTarget,
                )
              }
            >
              <Download className="size-4" />
              Download 1024 px PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={(event) =>
                dispatchEditorEvent(editorEvent.openExport, event.currentTarget)
              }
            >
              <Settings2 className="size-4" />
              Advanced export
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="More tools"
          >
            <Ellipsis className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[82dvh] overscroll-contain">
          <DrawerHeader>
            <DrawerTitle>More tools</DrawerTitle>
            <DrawerDescription>
              Manage your design, reusable assets, and export options.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-4">
            <MoreControls onClose={() => setMoreOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
