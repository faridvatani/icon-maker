import { useRef, useState } from "react";
import { Palette, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import {
  createBrandKit,
  readBrandKits,
  writeBrandKits,
  type BrandKit,
} from "@/features/editor/lib/brandKits";
import { defaultExportOptions } from "@/features/editor/lib/exportPng";
import { useEditorEvent } from "@/features/editor/hooks/useEditorEvent";
import {
  editorEvent,
  getEditorEventFocusTarget,
} from "@/features/editor/lib/editorEvents";

export function BrandKitDialog({
  showLabel = false,
  showTrigger = true,
}: {
  showLabel?: boolean;
  showTrigger?: boolean;
}) {
  const { storageValue, applySettings } = useStorage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamedValue, setRenamedValue] = useState("");
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const sync = () => setKits(readBrandKits());
  useEditorEvent(editorEvent.openBrandKits, (event) => {
    returnFocusRef.current = getEditorEventFocusTarget(event);
    sync();
    setOpen(true);
  });
  const save = () => {
    const next = [
      createBrandKit(name, storageValue, defaultExportOptions),
      ...kits,
    ];
    if (!writeBrandKits(next).ok) return;
    setKits(next);
    setName("");
  };
  const rename = () => {
    if (!renamingId) return;
    const next = kits.map((kit) =>
      kit.id === renamingId
        ? { ...kit, name: renamedValue.trim().slice(0, 48) || kit.name }
        : kit,
    );
    if (!writeBrandKits(next).ok) return;
    setKits(next);
    setRenamingId(null);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) sync();
        setOpen(next);
      }}
    >
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2"
          >
            <Palette className="size-4" />
            <span className={showLabel ? "inline" : "hidden sm:inline"}>
              Brand kits
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
          <DialogTitle>Brand kits</DialogTitle>
          <DialogDescription>
            Save the current design, palette, and 1024 px export preference in
            this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            aria-label="Brand kit name"
            value={name}
            maxLength={48}
            placeholder="Name this kit"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
            }}
          />
          <Button type="button" onClick={save}>
            Save current design as kit
          </Button>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {kits.length ? (
            kits.map((kit) => (
              <div
                key={kit.id}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                {renamingId === kit.id ? (
                  <Input
                    aria-label={`Rename ${kit.name}`}
                    autoFocus
                    value={renamedValue}
                    className="min-w-0 flex-1"
                    maxLength={48}
                    onChange={(event) => setRenamedValue(event.target.value)}
                    onBlur={rename}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") rename();
                      if (event.key === "Escape") setRenamingId(null);
                    }}
                  />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-w-0 flex-1 justify-start"
                    aria-label={`Load ${kit.name}`}
                    onClick={() => {
                      applySettings(kit.defaults);
                      setOpen(false);
                    }}
                  >
                    <span className="mr-3 flex -space-x-1" aria-hidden="true">
                      {kit.palette.map((color) => (
                        <span
                          key={color}
                          className="size-4 rounded-full border"
                          style={{ background: color }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate">{kit.name}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        Load design and palette
                      </span>
                    </span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Rename ${kit.name}`}
                  onClick={() => {
                    setRenamingId(kit.id);
                    setRenamedValue(kit.name);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${kit.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{kit.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the brand kit from this browser. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          const next = kits.filter(({ id }) => id !== kit.id);
                          if (!writeBrandKits(next).ok) return;
                          setKits(next);
                        }}
                      >
                        Delete brand kit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Save your first reusable brand kit.
            </p>
          )}
        </div>
        <DialogFooter>
          <p className="mr-auto text-xs text-muted-foreground">
            Up to 12 kits.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
