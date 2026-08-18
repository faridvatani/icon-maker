import { useRef, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEditorEvent } from "@/features/editor/hooks/useEditorEvent";
import {
  editorEvent,
  getEditorEventFocusTarget,
} from "@/features/editor/lib/editorEvents";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import {
  createPreset,
  readPresets,
  writePresets,
  type SavedPreset,
} from "@/features/editor/lib/presets";

export function PresetDialog({
  showLabel = false,
  showTrigger = true,
}: {
  showLabel?: boolean;
  showTrigger?: boolean;
}) {
  const { storageValue, applySettings } = useStorage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setPresets(readPresets());
    setOpen(nextOpen);
  };
  useEditorEvent(editorEvent.openSavedDesigns, (event) => {
    returnFocusRef.current = getEditorEventFocusTarget(event);
    handleOpenChange(true);
  });

  const savePreset = () => {
    const next = [createPreset(name, storageValue), ...presets];
    if (!writePresets(next).ok) return;
    setPresets(next);
    setName("");
  };

  const deletePreset = (id: string) => {
    const next = presets.filter((preset) => preset.id !== id);
    if (!writePresets(next).ok) return;
    setPresets(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2"
          >
            <Bookmark className="size-4" />
            <span className={showLabel ? "inline" : "hidden sm:inline"}>
              Saved designs
            </span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent
        className="max-w-md"
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef.current;
          returnFocusRef.current = null;
          if (!target?.isConnected) return;
          event.preventDefault();
          target.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Saved designs</DialogTitle>
          <DialogDescription>
            Save named snapshots of this design in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            aria-label="Preset name"
            value={name}
            maxLength={48}
            placeholder="Name this saved design"
            onChange={(event) => setName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") savePreset();
            }}
          />
          <Button type="button" onClick={savePreset}>
            Save
          </Button>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {presets.length ? (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="min-w-0 flex-1 justify-start truncate"
                  onClick={() => {
                    applySettings(preset.settings);
                    setOpen(false);
                  }}
                >
                  {preset.name}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${preset.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete “{preset.name}”?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the saved design from this browser. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deletePreset(preset.id)}
                      >
                        Delete saved design
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Save your first design snapshot.
            </p>
          )}
        </div>
        <DialogFooter>
          <p className="mr-auto text-xs text-muted-foreground">
            Up to 24 presets.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
