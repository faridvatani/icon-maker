import { Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SOLID_PRESETS } from "@/features/editor/data/backgroundPresets";
import { cn } from "@/lib/utils";

interface SolidColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function SolidColorPicker({
  value,
  onChange,
  className,
}: SolidColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-55 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex w-full items-center gap-2">
            {value ? (
              <span
                className="h-4 w-4 shrink-0 rounded"
                style={{ background: value }}
              />
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <span className="flex-1 truncate">{value || "Pick a color"}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-wrap gap-1.5">
          {SOLID_PRESETS.map((color) => (
            <button
              type="button"
              key={color}
              aria-label={`Use solid color ${color}`}
              aria-pressed={value === color}
              style={{ borderColor: value === color ? color : undefined }}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border-2 border-input bg-background p-1 transition-transform active:scale-95",
              )}
              onClick={() => onChange(color)}
            >
              <span
                aria-hidden="true"
                className="size-full rounded-[3px]"
                style={{ background: color }}
              />
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Custom color
          <input
            type="color"
            aria-label="Custom color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#09203f"}
            className="h-8 w-12 cursor-pointer rounded border bg-transparent p-1"
            onChange={(event) => onChange(event.currentTarget.value)}
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}
