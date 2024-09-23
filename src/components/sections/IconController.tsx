import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { GradientPicker } from "../ui/GradientPicker";

export const IconController = () => {
  const [size, setSize] = useState<number>(280);
  const [rotate, setRotate] = useState<number>(0);
  const [color, setColor] = useState<string>("#B4D455");

  const storageValue = JSON.parse(localStorage.getItem("values") || "{}");
  useEffect(() => {
    const updatedValue = {
      ...storageValue,
      iconSize: size,
      iconRotate: rotate,
      iconColor: color,
      icon: "smile",
    };
    localStorage.setItem("value", JSON.stringify(updatedValue));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, rotate, color]);

  return (
    <form className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Dimensions</legend>
        <div className="grid gap-3">
          <Label htmlFor="icon">Icon</Label>
          <div
            id="icon"
            className="w-12 h-12 p-2 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center"
          >
            <Smile />
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="size" className="flex justify-between items-center">
            <span>Size</span> {size}px
          </Label>
          <Slider
            id="size"
            name="size"
            defaultValue={[280]}
            max={512}
            step={1}
            onValueChange={(event) => setSize(event[0])}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="rotate" className="flex justify-between items-center">
            <span>Rotate</span> {rotate}&deg;
          </Label>
          <Slider
            id="rotate"
            name="rotate"
            defaultValue={[0]}
            max={360}
            step={1}
            onValueChange={(event) => setRotate(event[0])}
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <GradientPicker value={color} onChange={setColor} />
        </div>
      </fieldset>
    </form>
  );
};
