import { useDeferredValue, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getCatalogIconName,
  isCatalogIconValue,
  type CatalogIconName,
  type IconValue,
} from "@/features/editor/lib/iconTypes";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 48;
const ICON_NAMES = Object.keys(icons) as CatalogIconName[];

interface IconPickerDialogProps {
  value: IconValue;
  onSelect: (icon: IconValue) => void;
}

export default function IconPickerDialog({
  value,
  onSelect,
}: IconPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const selectedName = isCatalogIconValue(value)
    ? getCatalogIconName(value)
    : null;
  const filteredIcons = useMemo(
    () =>
      deferredSearch
        ? ICON_NAMES.filter((name) =>
            name.toLowerCase().includes(deferredSearch),
          )
        : ICON_NAMES,
    [deferredSearch],
  );
  const pageCount = Math.max(1, Math.ceil(filteredIcons.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount - 1);
  const visibleIcons = filteredIcons.slice(
    activePage * PAGE_SIZE,
    (activePage + 1) * PAGE_SIZE,
  );

  return (
    <DialogContent className="flex h-[min(760px,90vh)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
      <DialogHeader className="border-b px-6 py-5 pr-12">
        <DialogTitle>Choose an icon</DialogTitle>
        <DialogDescription>
          Search the complete catalog. Icons load only when they are visible.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            aria-label="Search icons"
            placeholder="Search icons, for example: camera or arrow"
            value={search}
            className="pl-9"
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(0);
            }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {filteredIcons.length.toLocaleString()} icons
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {visibleIcons.length ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {visibleIcons.map((name) => {
              const selected = selectedName === name;
              const IconComponent = icons[name];
              return (
                <button
                  type="button"
                  key={name}
                  aria-label={`Select ${name}`}
                  aria-pressed={selected}
                  title={name}
                  className={cn(
                    "relative flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-lg border bg-background px-1.5 py-2 text-[10px] text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected &&
                      "border-primary bg-primary/5 text-foreground ring-1 ring-primary",
                  )}
                  onClick={() => onSelect(`library:${name}`)}
                >
                  <IconComponent className="size-6" />
                  <span className="w-full truncate text-center">{name}</span>
                  {selected ? (
                    <Check className="absolute right-1.5 top-1.5 size-3.5 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium">No icons found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a shorter or more general search.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t bg-background px-6 py-3 text-xs text-muted-foreground">
        <span>
          Page {activePage + 1} of {pageCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={activePage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={activePage >= pageCount - 1}
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
