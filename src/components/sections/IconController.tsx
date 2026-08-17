import { Slider } from "@/components/ui/slider";
import { GradientPicker } from "@/components/ui/GradientPicker";
import { useStorage } from "@/context/StorageContext";
import { IconList } from "./IconList";

export const IconController = () => {
  const { storageValue, setStorageValue } = useStorage();
  const iconSize = (storageValue.iconSize as number) ?? 280;
  const iconRotate = (storageValue.iconRotate as number) ?? 0;
  const iconColor = (storageValue.iconColor as string) ?? "#09203f";

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
          <div
            id="size-label"
            className="flex justify-between items-center text-sm font-medium"
          >
            <span>Size</span> {iconSize}px
          </div>
          <Slider
            id="size"
            aria-labelledby="size-label"
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
          <div
            id="rotate-label"
            className="flex justify-between items-center text-sm font-medium"
          >
            <span>Rotate</span> {iconRotate}&deg;
          </div>
          <Slider
            id="rotate"
            aria-labelledby="rotate-label"
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
