import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { useMemo } from "react";

const SOLID_PRESETS = [
  "#E2E2E2",
  "#ff75c3",
  "#ffa647",
  "#ffe83f",
  "#9fff5b",
  "#70e2ff",
  "#cd93ff",
  "#09203f",
];

const GRADIENT_PRESETS = [
  "linear-gradient(to top left,#accbee,#e7f0fd)",
  "linear-gradient(to top left,#d5d4d0,#d5d4d0,#eeeeec)",
  "linear-gradient(to top left,#000000,#434343)",
  "linear-gradient(to top left,#09203f,#537895)",
  "linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)",
  "linear-gradient(to top left,#f953c6,#b91d73)",
  "linear-gradient(to top left,#ee0979,#ff6a00)",
  "linear-gradient(to top left,#F00000,#DC281E)",
  "linear-gradient(to top left,#00c6ff,#0072ff)",
  "linear-gradient(to top left,#4facfe,#00f2fe)",
  "linear-gradient(to top left,#0ba360,#3cba92)",
  "linear-gradient(to top left,#FDFC47,#24FE41)",
  "linear-gradient(to top left,#8a2be2,#0000cd,#228b22,#ccff00)",
  "linear-gradient(to top left,#40E0D0,#FF8C00,#FF0080)",
  "linear-gradient(to top left,#fcc5e4,#fda34b,#ff7882,#c8699e,#7046aa,#0c1db8,#020f75)",
  "linear-gradient(to top left,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)",
];

const IMAGE_PRESETS = [
  { name: "Aurora", file: "aurora.svg" },
  { name: "Sunset", file: "sunset.svg" },
  { name: "Lagoon", file: "lagoon.svg" },
  { name: "Midnight", file: "midnight.svg" },
].map(({ name, file }) => ({
  name,
  background: `url("${import.meta.env.BASE_URL}backgrounds/${file}")`,
}));

export function GradientPicker({
  value,
  onChange,
  className,
  hideGradient,
  hideImage,
}: {
  value: string;
  onChange: (background: string) => void;
  className?: string;
  hideGradient?: boolean;
  hideImage?: boolean;
}) {
  const defaultTab = useMemo(() => {
    if (value.includes("url")) return "image";
    if (value.includes("gradient")) return "gradient";
    return "solid";
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-[220px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <div className="w-full flex items-center gap-2">
            {value ? (
              <div
                className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                style={{ background: value }}
              ></div>
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="truncate flex-1">
              {value ? value : "Pick a color"}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger
              className="flex-1 data-[state=inactive]:text-foreground"
              value="solid"
            >
              Solid
            </TabsTrigger>
            {!hideGradient && (
              <TabsTrigger
                className="flex-1 data-[state=inactive]:text-foreground"
                value="gradient"
              >
                Gradient
              </TabsTrigger>
            )}
            {!hideImage && (
              <TabsTrigger
                className="flex-1 data-[state=inactive]:text-foreground"
                value="image"
              >
                Image
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="solid" className="flex flex-wrap gap-1 mt-0">
            {SOLID_PRESETS.map((s) => (
              <button
                type="button"
                key={s}
                aria-label={`Use solid color ${s}`}
                style={{ background: s }}
                className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                onClick={() => onChange(s)}
              />
            ))}
          </TabsContent>

          <TabsContent value="gradient" className="mt-0">
            <div className="flex flex-wrap gap-1 mb-2">
              {GRADIENT_PRESETS.map((s, index) => (
                <button
                  type="button"
                  key={s}
                  aria-label={`Use gradient ${index + 1}`}
                  style={{ background: s }}
                  className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                  onClick={() => onChange(s)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <div className="grid grid-cols-2 gap-1 mb-2">
              {IMAGE_PRESETS.map(({ name, background }) => (
                <button
                  type="button"
                  key={name}
                  aria-label={`Use ${name} image background`}
                  style={{ backgroundImage: background }}
                  className="rounded-md bg-cover bg-center h-12 w-full cursor-pointer active:scale-105"
                  onClick={() => onChange(background)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Input
          id="custom"
          aria-label="Custom background value"
          value={value}
          className="col-span-2 h-8 mt-4"
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  );
}
