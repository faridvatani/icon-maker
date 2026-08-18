import {
  Component,
  lazy,
  Suspense,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronRight, FileUp, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/features/editor/components/Icon";
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

function IconPickerLoadingDialog() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span role="status">Loading icons…</span>
    </div>
  );
}

class IconPickerErrorBoundary extends Component<
  { children: ReactNode; onClose: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Could not load the icon library</AlertTitle>
          <AlertDescription className="mt-2 grid gap-3">
            <p>Check your connection, then reload to try again.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={this.props.onClose}
              >
                Close
              </Button>
              <Button type="button" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Icon</p>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full max-w-55 justify-start gap-3 px-3 text-left"
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
          </Button>
        </DialogTrigger>

        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/svg+xml,.svg"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) =>
            void handleFileChange(event.currentTarget.files?.[0])
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => inputRef.current?.click()}
            disabled={uploadState === "uploading"}
          >
            {uploadState === "uploading" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileUp className="size-3.5" />
            )}
            {uploadState === "uploading" ? "Importing…" : "Import SVG"}
          </Button>
          {isCustomIconValue(value) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => void removeCustomIcon()}
            >
              <Trash2 className="size-3.5" />
              Remove uploaded icon
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          SVG only, up to 250 KB. Uploaded icons stay on this device.
        </p>
        {uploadState === "error" ? (
          <Alert variant="destructive" className="py-2 text-xs">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        ) : null}

        {isDialogOpen ? (
          <DialogContent className="flex h-[min(760px,90vh)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
            <IconPickerErrorBoundary onClose={() => setIsDialogOpen(false)}>
              <Suspense fallback={<IconPickerLoadingDialog />}>
                <IconPickerDialog
                  value={value}
                  onSelect={(icon) => {
                    selectIcon(icon);
                    setIsDialogOpen(false);
                  }}
                />
              </Suspense>
            </IconPickerErrorBoundary>
          </DialogContent>
        ) : null}
      </div>
    </Dialog>
  );
}
