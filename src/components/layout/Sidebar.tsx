import { twMerge } from "tailwind-merge";
import { Image, PencilRuler, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SidebarItems = [
  {
    label: "Icon",
    icon: PencilRuler,
  },
  {
    label: "Background",
    icon: Image,
  },
];

interface SidebarProps {
  value: number;
  onValueChange: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ value, onValueChange }) => {
  return (
    <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
      <div className="border-b p-2">
        <Button variant="outline" size="icon" aria-label="Home">
          <Triangle className="size-5 fill-foreground" />
        </Button>
      </div>
      <nav className="grid gap-1 p-2">
        <TooltipProvider>
          {SidebarItems.map((item, index) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={twMerge(
                    "rounded-lg hover:bg-muted",
                    value === index ? "bg-muted" : "",
                  )}
                  aria-label={item.label}
                  onClick={() => onValueChange(index)}
                >
                  <item.icon
                    className={`size-5 ${
                      value === index ? "text-gray-900" : "text-gray-500"
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
};
