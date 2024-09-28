import { Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconController } from "@/components/sections/IconController";
import { BackgroundController } from "@/components/sections/BackgroundController";

interface HeaderProps {
  selectedIndex: number;
  downloadbtn: () => void;
}

export const Header = ({ selectedIndex, downloadbtn }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
      <h1 className="text-xl font-semibold">Icon Maker</h1>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the settings for the icon and background
            </DrawerDescription>
          </DrawerHeader>
          {selectedIndex === 0 ? <IconController /> : <BackgroundController />}
        </DrawerContent>
      </Drawer>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto gap-1.5 text-sm"
        onClick={downloadbtn}
      >
        <Download className="size-4" />
        Download
      </Button>
    </header>
  );
};
