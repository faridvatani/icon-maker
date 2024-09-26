import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GradientPicker } from "@/components/ui/GradientPicker";
import { useStorage } from "@/context/StorageContext";
import { IconList } from "./IconList";

export const IconController = () => {
  const { storageValue, setStorageValue } = useStorage();
  const iconSize = (storageValue.iconSize as number) ?? 280;
  const iconRotate = (storageValue.iconRotate as number) ?? 0;
  const iconColor = (storageValue.iconColor as string) ?? "#09203f";

  useEffect(() => {
    const updatedValue = {
      ...storageValue,
      iconSize,
      iconRotate,
      iconColor,
      icon: storageValue.icon,
    };
    setStorageValue(updatedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconSize, iconRotate, iconColor]);

  return (
    <form className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Properties</legend>
        <div className="grid gap-3">
          <IconList
            onIconSelect={(icon: string) =>
              setStorageValue({ ...storageValue, icon })
            }
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="size" className="flex justify-between items-center">
            <span>Size</span> {iconSize}px
          </Label>
          <Slider
            id="size"
            name="size"
            defaultValue={[iconSize]}
            max={512}
            step={1}
            onValueChange={(value) =>
              setStorageValue({ ...storageValue, iconSize: value[0] })
            }
            className="cursor-pointer"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="rotate" className="flex justify-between items-center">
            <span>Rotate</span> {iconRotate}&deg;
          </Label>
          <Slider
            id="rotate"
            name="rotate"
            defaultValue={[iconRotate]}
            max={360}
            step={1}
            onValueChange={(value) =>
              setStorageValue({ ...storageValue, iconRotate: value[0] })
            }
            className="cursor-pointer"
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <GradientPicker
            value={iconColor}
            onChange={(value) =>
              setStorageValue({ ...storageValue, iconColor: value })
            }
            hideGradient
            hideImage
          />
        </div>
      </fieldset>
    </form>
  );
};
