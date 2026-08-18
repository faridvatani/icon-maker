import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const shortcuts = [
  ["?", "Open this shortcut reference"],
  ["E", "Open export"],
  ["I", "Open icon controls"],
  ["B", "Open background controls"],
  ["⌘/Ctrl Z", "Undo"],
  ["⌘/Ctrl Shift Z", "Redo"],
  ["⌘/Ctrl Shift X", "Reset with confirmation"],
];

export function KeyboardShortcutsDialog({
  showLabel = false,
  showTrigger = true,
}: {
  showLabel?: boolean;
  showTrigger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const openDialog = () => setOpen(true);
    window.addEventListener("icon-maker:open-shortcuts", openDialog);
    return () =>
      window.removeEventListener("icon-maker:open-shortcuts", openDialog);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={showLabel ? "sm" : "icon"}
            className={showLabel ? "gap-1.5 justify-start" : undefined}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <Keyboard className="size-4" />
            {showLabel ? "Keyboard shortcuts" : null}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts do not run while you type or interact with a dialog.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-2 text-sm">
          {shortcuts.map(([key, description]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-md border px-3 py-2"
            >
              <dt>{description}</dt>
              <dd>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                  {key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
