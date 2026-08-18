import { lazy, Suspense, useRef, useState } from "react";
import { ChevronRight, FileUp, Loader2, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import Icon from "@/features/editor/components/Icon";
import { Label } from "@/components/ui/label";
import {
  formatIconLabel,
  isCustomIconValue,
  type IconValue,
} from "@/features/editor/lib/iconTypes";
import {
  deleteCustomIcon,
  saveCustomIcon,
} from "@/features/editor/services/customIconStore";
import { recordRecentIcon } from "@/features/editor/lib/recents";

const IconPickerDialog = lazy(
  () => import("@/features/editor/components/IconPickerDialog"),
);

interface IconListProps {
  value: IconValue;
  color: string;
  onIconSelect: (icon: IconValue) => void;
}

export function IconList({ value, color, onIconSelect }: IconListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectIcon = (icon: IconValue) => {
    recordRecentIcon(icon);
    onIconSelect(icon);
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    setUploadState("uploading");
    setUploadError("");
    try {
      const asset = await saveCustomIcon(file);
      selectIcon(asset.id);
      setUploadState("idle");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not import SVG",
      );
      setUploadState("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeCustomIcon = async () => {
    if (!isCustomIconValue(value)) return;
    await deleteCustomIcon(value);
    selectIcon("FaceSlightlySmiling");
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="icon">Icon</Label>
      <button
        type="button"
        id="icon"
        onClick={() => setIsDialogOpen(true)}
        className="flex h-14 w-full max-w-55 items-center gap-3 rounded-lg border bg-background px-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon name={value} color={color} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {formatIconLabel(value)}
          </span>
          <span className="block text-xs text-muted-foreground">
            Change icon
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/svg+xml,.svg"
        onChange={(event) =>
          void handleFileChange(event.currentTarget.files?.[0])
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => inputRef.current?.click()}
          disabled={uploadState === "uploading"}
        >
          {uploadState === "uploading" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileUp className="size-3.5" />
          )}
          {uploadState === "uploading" ? "Importing…" : "Import SVG"}
        </button>
        {isCustomIconValue(value) ? (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => void removeCustomIcon()}
          >
            <Trash2 className="size-3.5" />
            Remove uploaded icon
          </button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        SVG only, up to 250 KB. Uploaded icons stay on this device.
      </p>
      {uploadState === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {uploadError}
        </p>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {isDialogOpen ? (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-3 text-sm shadow-lg">
                  <Loader2 className="size-4 animate-spin" />
                  Loading icons…
                </div>
              </div>
            }
          >
            <IconPickerDialog
              value={value}
              onSelect={(icon) => {
                selectIcon(icon);
                setIsDialogOpen(false);
              }}
            />
          </Suspense>
        ) : null}
      </Dialog>
    </div>
  );
}
