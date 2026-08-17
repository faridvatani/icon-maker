import { useStorage } from "@/context/StorageContext";
import { Slider } from "@/components/ui/slider";
import { GradientPicker } from "@/components/ui/GradientPicker";

export const BackgroundController = () => {
  const { storageValue, setStorageValue } = useStorage();
  const bgRounded = (storageValue.bgRounded as number) ?? 0;
  const bgPadding = (storageValue.bgPadding as number) ?? 0;
  const bgColor = (storageValue.bgColor as string) ?? "#E2E2E2";

  return (
    <form className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">
          Layout Styles
        </legend>
        <div className="grid gap-3">
          <div
            id="rounded-label"
            className="flex justify-between items-center text-sm font-medium"
          >
            <span>Rounded</span> {bgRounded}px
          </div>
          <Slider
            id="rounded"
            aria-labelledby="rounded-label"
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
          <div
            id="padding-label"
            className="flex justify-between items-center text-sm font-medium"
          >
            <span>Padding</span> {bgPadding}px
          </div>
          <Slider
            id="padding"
            aria-labelledby="padding-label"
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
