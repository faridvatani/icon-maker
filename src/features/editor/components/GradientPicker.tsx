import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayeredGradient } from "@/features/editor/components/LayeredGradient";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORIES,
  GRADIENTS,
  GRADIENTS_BY_ID,
  type Category,
} from "@/features/editor/data/gradients";
import {
  BACKGROUND_IMAGES,
  SOLID_PRESETS,
} from "@/features/editor/data/backgroundPresets";
import { cn } from "@/lib/utils";

const IMAGE_PRESETS = BACKGROUND_IMAGES.map(({ name, file }) => ({
  name,
  background: `url("${import.meta.env.BASE_URL}backgrounds/${file}")`,
}));

const PAGE_SIZE = 12;

interface GradientPickerProps {
  value: string;
  gradientValue?: string | null;
  onChange: (background: string) => void;
  onGradientChange?: (gradientId: string) => void;
  className?: string;
}

export function GradientPicker({
  value,
  gradientValue,
  onChange,
  onGradientChange,
  className,
}: GradientPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [page, setPage] = useState(0);

  const selectedGradient = gradientValue
    ? GRADIENTS_BY_ID.get(gradientValue)
    : undefined;
  const defaultTab = gradientValue
    ? "gradient"
    : value.includes("url")
      ? "image"
      : "solid";
  const matchingGradients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return GRADIENTS.filter((gradient) => {
      const matchesCategory =
        category === "all" || gradient.category === category;
      const matchesSearch =
        !normalizedSearch ||
        gradient.name.toLowerCase().includes(normalizedSearch) ||
        gradient.desc.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);
  const pageCount = Math.max(
    1,
    Math.ceil(matchingGradients.length / PAGE_SIZE),
  );
  const activePage = Math.min(page, pageCount - 1);
  const visibleGradients = matchingGradients.slice(
    activePage * PAGE_SIZE,
    (activePage + 1) * PAGE_SIZE,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-55 justify-start text-left font-normal",
            !value && !selectedGradient && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex w-full items-center gap-2">
            {selectedGradient ? (
              <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded">
                <LayeredGradient gradientId={selectedGradient.id} thumbnail />
              </span>
            ) : value ? (
              <span
                className="h-4 w-4 shrink-0 rounded bg-center! bg-cover!"
                style={{ background: value }}
              />
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <span className="flex-1 truncate">
              {selectedGradient?.name ?? (value || "Pick a color")}
            </span>
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="flex max-h-[min(32rem,var(--radix-popover-content-available-height))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden p-3"
      >
        <Tabs
          key={`${defaultTab}-${gradientValue ?? value}`}
          defaultValue={defaultTab}
          className="flex min-h-0 w-full flex-1 flex-col"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger className="flex-1" value="solid">
              Solid
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="gradient">
              Gradient
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="image">
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="solid"
            className="mt-3 min-h-0 overflow-y-auto pr-1"
          >
            <div className="flex flex-wrap gap-1.5">
              {SOLID_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={`Use solid color ${color}`}
                  aria-pressed={!gradientValue && value === color}
                  style={{ background: color }}
                  className={cn(
                    "h-7 w-7 rounded-md border transition-transform active:scale-95",
                    !gradientValue &&
                      value === color &&
                      "ring-2 ring-foreground ring-offset-2",
                  )}
                  onClick={() => onChange(color)}
                />
              ))}
              <label className="mt-3 flex w-full items-center justify-between gap-3 text-sm">
                Custom color
                <input
                  type="color"
                  aria-label="Custom background color"
                  value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#E2E2E2"}
                  className="h-8 w-12 cursor-pointer rounded border bg-transparent p-1"
                  onChange={(event) => onChange(event.currentTarget.value)}
                />
              </label>
            </div>
          </TabsContent>

          <TabsContent
            value="gradient"
            className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-[1fr_112px] gap-2">
              <Input
                aria-label="Search gradients"
                placeholder="Search gradients"
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(0);
                }}
              />
              <select
                aria-label="Gradient category"
                value={category}
                className="h-9 rounded-md border bg-background px-2 text-sm"
                onChange={(event) => {
                  setCategory(event.currentTarget.value as Category | "all");
                  setPage(0);
                }}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {visibleGradients.map((gradient) => (
                <button
                  type="button"
                  key={gradient.id}
                  aria-label={`Use gradient ${gradient.name}`}
                  aria-pressed={gradientValue === gradient.id}
                  className={cn(
                    "relative h-16 overflow-hidden rounded-lg border text-left transition-transform active:scale-[0.98]",
                    gradientValue === gradient.id &&
                      "ring-2 ring-foreground ring-offset-2",
                  )}
                  onClick={() => onGradientChange?.(gradient.id)}
                >
                  <LayeredGradient gradientId={gradient.id} thumbnail />
                  <span className="absolute inset-x-0 bottom-0 z-10 bg-black/45 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {gradient.name}
                  </span>
                  {gradientValue === gradient.id ? (
                    <Check className="absolute right-1.5 top-1.5 z-10 size-4 rounded-full bg-white p-0.5 text-black" />
                  ) : null}
                </button>
              ))}
            </div>

            {visibleGradients.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No gradients match this search.
              </p>
            ) : null}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {matchingGradients.length} gradient
                {matchingGradients.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Previous gradient page"
                  disabled={activePage === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="min-w-12 text-center">
                  {activePage + 1} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Next gradient page"
                  disabled={activePage >= pageCount - 1}
                  onClick={() =>
                    setPage((current) => Math.min(pageCount - 1, current + 1))
                  }
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </span>
            </div>
          </TabsContent>

          <TabsContent
            value="image"
            className="mt-3 min-h-0 overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_PRESETS.map(({ name, background }) => (
                <button
                  type="button"
                  key={name}
                  aria-label={`Use ${name} image background`}
                  style={{ backgroundImage: background }}
                  className="h-14 w-full rounded-md bg-cover bg-center transition-transform active:scale-[0.98]"
                  onClick={() => onChange(background)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
