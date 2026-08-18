import {
  Bookmark,
  Image,
  Keyboard,
  Palette,
  PencilRuler,
  Triangle,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
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
    event: "icon-maker:open-saved-designs",
  },
  { label: "Brand kits", icon: Palette, event: "icon-maker:open-brand-kits" },
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
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={twMerge(
            "rounded-lg hover:bg-muted",
            active ? "bg-muted" : "",
          )}
          aria-label={label}
          onClick={onClick}
        >
          <Icon
            className={twMerge(
              "size-5 text-muted-foreground",
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
  <aside className="inset-y fixed left-0 z-20 flex h-full w-14 flex-col border-r bg-background">
    <div className="border-b p-2">
      <Button variant="outline" size="icon" aria-label="Home">
        <Triangle className="size-5 fill-foreground" />
      </Button>
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
            onClick={() => window.dispatchEvent(new Event(item.event))}
          />
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <SidebarButton
          label="Keyboard shortcuts"
          icon={Keyboard}
          onClick={() =>
            window.dispatchEvent(new Event("icon-maker:open-shortcuts"))
          }
        />
      </div>
    </TooltipProvider>
  </aside>
);
