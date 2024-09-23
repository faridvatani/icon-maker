import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { GradientPicker } from "@/components/ui/GradientPicker";

export const BackgroundController = () => {
  const [rounded, setRounded] = useState<number>(0);
  const [padding, setPadding] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#B4D455");

  const storageValue = JSON.parse(localStorage.getItem("value") || "{}");
  useEffect(() => {
    const updatedValue = {
      ...storageValue,
      bgRounded: rounded,
      bgPadding: padding,
      bgColor: backgroundColor,
    };
    localStorage.setItem("value", JSON.stringify(updatedValue));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounded, padding, backgroundColor]);

  return (
    <form className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">
          Layout Styles
        </legend>
        <div className="grid gap-3">
          <Label
            htmlFor="rounded"
            className="flex justify-between items-center"
          >
            <span>Rounded</span> {rounded}px
          </Label>
          <Slider
            id="rounded"
            name="rounded"
            defaultValue={[0]}
            max={512}
            step={1}
            onValueChange={(event) => setRounded(event[0])}
          />
        </div>
        <div className="grid gap-3">
          <Label
            htmlFor="padding"
            className="flex justify-between items-center"
          >
            <span>Padding</span> {padding}px
          </Label>
          <Slider
            id="padding"
            name="padding"
            defaultValue={[40]}
            max={100}
            step={1}
            onValueChange={(event) => setPadding(event[0])}
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <GradientPicker
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
      </fieldset>
    </form>
  );
};
