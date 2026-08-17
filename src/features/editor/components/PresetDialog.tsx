import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import {
  createPreset,
  readPresets,
  writePresets,
  type SavedPreset,
} from "@/features/editor/lib/presets";

export function PresetDialog() {
  const { storageValue, applySettings } = useStorage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [presets, setPresets] = useState<SavedPreset[]>([]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setPresets(readPresets());
    setOpen(nextOpen);
  };

  const savePreset = () => {
    const next = [createPreset(name, storageValue), ...presets];
    writePresets(next);
    setPresets(next);
    setName("");
  };

  const deletePreset = (id: string) => {
    const next = presets.filter((preset) => preset.id !== id);
    writePresets(next);
    setPresets(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2"
        >
          <Bookmark className="size-4" />
          <span className="hidden sm:inline">Presets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved presets</DialogTitle>
          <DialogDescription>
            Presets are saved only in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            aria-label="Preset name"
            value={name}
            maxLength={48}
            placeholder="Preset name"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${preset.name}`}
                  onClick={() => deletePreset(preset.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Save your first reusable design.
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
