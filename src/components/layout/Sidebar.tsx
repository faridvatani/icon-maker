import {
  Bookmark,
  Image,
  Keyboard,
  Palette,
  PencilRuler,
  Triangle,
} from "lucide-react";
import type { MouseEventHandler } from "react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import {
  dispatchEditorEvent,
  editorEvent,
} from "@/features/editor/lib/editorEvents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const editorItems = [
  { label: "Icon", icon: PencilRuler },
  { label: "Background", icon: Image },
];
const libraryItems = [
  {
    label: "Saved designs",
    icon: Bookmark,
    event: editorEvent.openSavedDesigns,
  },
  { label: "Brand kits", icon: Palette, event: editorEvent.openBrandKits },
];

interface SidebarProps {
  value: number;
  onValueChange: (index: number) => void;
}

function SidebarButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof PencilRuler;
  active?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={twMerge(
            "relative overflow-hidden rounded-lg hover:bg-muted",
          )}
          aria-label={label}
          onClick={onClick}
        >
          {active ? (
            <motion.span
              layoutId="active-editor-panel"
              className="pointer-events-none absolute inset-0 rounded-lg bg-muted"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          ) : null}
          <Icon
            className={twMerge(
              "relative size-5 text-muted-foreground",
              active ? "text-foreground" : "",
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ value, onValueChange }) => (
  <aside className="inset-y fixed left-0 z-20 hidden h-full w-14 flex-col border-r bg-background md:flex">
    <div className="border-b p-2 h-14">
      <div
        className="flex size-9 items-center justify-center rounded-md border"
        aria-hidden="true"
      >
        <Triangle className="size-5 fill-foreground" />
      </div>
    </div>
    <TooltipProvider>
      <nav aria-label="Editor sections" className="grid gap-1 p-2">
        {editorItems.map((item, index) => (
          <SidebarButton
            key={item.label}
            {...item}
            active={value === index}
            onClick={() => onValueChange(index)}
          />
        ))}
      </nav>
      <nav aria-label="Saved design tools" className="grid gap-1 border-t p-2">
        {libraryItems.map((item) => (
          <SidebarButton
            key={item.label}
            label={item.label}
            icon={item.icon}
            onClick={(event) =>
              dispatchEditorEvent(item.event, event.currentTarget)
            }
          />
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <SidebarButton
          label="Keyboard shortcuts"
          icon={Keyboard}
          onClick={(event) =>
            dispatchEditorEvent(editorEvent.openShortcuts, event.currentTarget)
          }
        />
      </div>
    </TooltipProvider>
  </aside>
);
