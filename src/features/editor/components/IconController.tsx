import { Slider } from "@/components/ui/slider";
import { SolidColorPicker } from "@/features/editor/components/SolidColorPicker";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { IconList } from "@/features/editor/components/IconList";
import { IconEffectsControls } from "@/features/editor/components/EffectsControls";
import { ContrastAdvisor } from "@/features/editor/components/ContrastAdvisor";

export const IconController = () => {
  const {
    storageValue,
    updateStorageValue,
    previewStorageValue,
    commitStorageValue,
  } = useStorage();
  const { icon, iconSize, iconRotate, iconColor, iconEffects } = storageValue;

  return (
    <div className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Properties</legend>
        <div className="grid gap-3">
          <IconList
            value={icon}
            color={iconColor}
            onIconSelect={(icon) => updateStorageValue({ icon })}
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
            value={[iconSize]}
            max={512}
            step={1}
            onValueChange={(value) =>
              previewStorageValue({ iconSize: value[0] })
            }
            onValueCommit={commitStorageValue}
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
            value={[iconRotate]}
            max={360}
            step={1}
            onValueChange={(value) =>
              previewStorageValue({ iconRotate: value[0] })
            }
            onValueCommit={commitStorageValue}
            className="cursor-pointer"
          />
        </div>
        <ContrastAdvisor
          fingerprint={JSON.stringify({
            bgColor: storageValue.bgColor,
            bgGradientId: storageValue.bgGradientId,
            backgroundEffects: storageValue.backgroundEffects,
          })}
          currentColor={iconColor}
          onApply={(iconColor) => updateStorageValue({ iconColor })}
        />
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <SolidColorPicker
            value={iconColor}
            onChange={(iconColor) => updateStorageValue({ iconColor })}
          />
        </div>
      </fieldset>
      <IconEffectsControls
        value={iconEffects}
        onPreview={(iconEffects) => previewStorageValue({ iconEffects })}
        onUpdate={(iconEffects) => updateStorageValue({ iconEffects })}
        onCommit={commitStorageValue}
      />
    </div>
  );
};
