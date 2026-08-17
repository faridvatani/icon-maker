import { lazy, Suspense } from "react";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import Icon from "@/features/editor/components/Icon";

const LayeredGradient = lazy(() =>
  import("@/features/editor/components/LayeredGradient").then((module) => ({
    default: module.LayeredGradient,
  })),
);

export const LogoPreview = () => {
  const { storageValue } = useStorage();

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        id="logo-preview"
        className="relative isolate flex aspect-square w-full max-w-138 items-center justify-center overflow-hidden"
        style={{
          borderRadius: storageValue.bgRounded,
          padding: storageValue.bgPadding,
          background: storageValue.bgGradientId
            ? undefined
            : storageValue.bgColor,
        }}
      >
        {storageValue.bgGradientId ? (
          <Suspense fallback={null}>
            <LayeredGradient gradientId={storageValue.bgGradientId} />
          </Suspense>
        ) : null}
        <div className="relative z-10 flex items-center justify-center">
          <Icon
            name={storageValue.icon}
            color={storageValue.iconColor}
            size={storageValue.iconSize}
            rotate={storageValue.iconRotate}
          />
        </div>
      </div>
    </div>
  );
};
