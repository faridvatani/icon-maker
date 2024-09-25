import { useEffect } from "react";
import { useStorage } from "@/context/StorageContext";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GradientPicker } from "@/components/ui/GradientPicker";

export const BackgroundController = () => {
  const { storageValue, setStorageValue } = useStorage();
  const bgRounded = (storageValue.bgRounded as number) ?? 0;
  const bgPadding = (storageValue.bgPadding as number) ?? 0;
  const bgColor = (storageValue.bgColor as string) ?? "#E2E2E2";

  useEffect(() => {
    const updatedValue = {
      ...storageValue,
      bgRounded,
      bgPadding,
      bgColor,
    };
    setStorageValue(updatedValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgRounded, bgPadding, bgColor]);

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
            <span>Rounded</span> {bgRounded}px
          </Label>
          <Slider
            id="rounded"
            name="rounded"
            defaultValue={[bgRounded]}
            max={512}
            step={1}
            onValueChange={(value) =>
              setStorageValue({ ...storageValue, bgRounded: value[0] })
            }
            className="cursor-pointer"
          />
        </div>
        <div className="grid gap-3">
          <Label
            htmlFor="padding"
            className="flex justify-between items-center"
          >
            <span>Padding</span> {bgPadding}px
          </Label>
          <Slider
            id="padding"
            name="padding"
            defaultValue={[bgPadding]}
            max={100}
            step={1}
            onValueChange={(value) =>
              setStorageValue({ ...storageValue, bgPadding: value[0] })
            }
            className="cursor-pointer"
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <GradientPicker
            value={bgColor}
            onChange={(value) =>
              setStorageValue({ ...storageValue, bgColor: value })
            }
          />
        </div>
      </fieldset>
    </form>
  );
};
