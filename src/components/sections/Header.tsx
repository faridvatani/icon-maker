import { useState } from "react";
import html2canvas from "html2canvas-pro";
import { Download, Loader2, Settings } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import { IconController } from "@/components/sections/IconController";
import { BackgroundController } from "@/components/sections/BackgroundController";

interface HeaderProps {
  selectedIndex: number;
}

export const Header = ({ selectedIndex }: HeaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const logoPreviewDiv = document.querySelector("#logo-preview");
      if (logoPreviewDiv) {
        const canvas = await html2canvas(logoPreviewDiv as HTMLElement, {
          backgroundColor: null,
        });
        const pngImage = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngImage;
        downloadLink.download = "Icon.png";
        downloadLink.click();
      }
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setLoading(false);
    }
  };

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
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {loading ? "Loading..." : "Download"}
      </Button>
    </header>
  );
};
