import { Gem, Image, PencilRuler, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const SidebarItems = [
  {
    label: "Icon",
    icon: PencilRuler,
  },
  {
    label: "Background",
    icon: Image,
  },
  {
    label: "Upgrade",
    icon: Gem,
  },
];

interface SidebarProps {
  selectedSidebarItem: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedSidebarItem }) => {
  const [active, setActive] = useState<number>(0);

  const handleActive = (index: number) => {
    setActive(index);
    selectedSidebarItem(index);
  };

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
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={twMerge(
                    "rounded-lg hover:bg-muted",
                    active === index ? "bg-muted" : "",
                  )}
                  aria-label={item.label}
                  onClick={() => handleActive(index)}
                >
                  <item.icon
                    className={`size-5 ${
                      active === index ? "text-gray-900" : "text-gray-500"
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
