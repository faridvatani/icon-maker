import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { Slider } from "@/components/ui/slider";
import {
  GradientPicker,
  RecentGradientSection,
} from "@/features/editor/components/GradientPicker";
import { BackgroundEffectsControls } from "@/features/editor/components/EffectsControls";

export const BackgroundController = () => {
  const {
    storageValue,
    updateStorageValue,
    previewStorageValue,
    commitStorageValue,
  } = useStorage();
  const { bgRounded, bgPadding, bgColor, bgGradientId, backgroundEffects } =
    storageValue;

  return (
    <div className="grid w-full items-start gap-6">
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
            value={[bgRounded]}
            max={512}
            step={1}
            onValueChange={(value) =>
              previewStorageValue({ bgRounded: value[0] })
            }
            onValueCommit={commitStorageValue}
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
            value={[bgPadding]}
            max={100}
            step={1}
            onValueChange={(value) =>
              previewStorageValue({ bgPadding: value[0] })
            }
            onValueCommit={commitStorageValue}
            className="cursor-pointer"
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Colors</legend>
        <div className="grid gap-3">
          <GradientPicker
            value={bgColor}
            gradientValue={bgGradientId}
            showRecents={false}
            onChange={(value) =>
              updateStorageValue({ bgColor: value, bgGradientId: null })
            }
            onGradientChange={(bgGradientId) =>
              updateStorageValue({ bgGradientId })
            }
          />
        </div>
        <RecentGradientSection
          refreshKey={bgGradientId}
          onSelect={(bgGradientId) => updateStorageValue({ bgGradientId })}
        />
      </fieldset>
      <BackgroundEffectsControls
        value={backgroundEffects}
        onPreview={(backgroundEffects) =>
          previewStorageValue({ backgroundEffects })
        }
        onUpdate={(backgroundEffects) =>
          updateStorageValue({ backgroundEffects })
        }
        onCommit={commitStorageValue}
      />
    </div>
  );
};
