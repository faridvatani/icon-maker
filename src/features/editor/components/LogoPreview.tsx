import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import Icon from "@/features/editor/components/Icon";
import { BackgroundRenderer } from "@/features/editor/components/BackgroundRenderer";
import { usePreviewElement } from "@/features/editor/state/PreviewElementContext";

export const LogoPreview = () => {
  const { storageValue } = useStorage();
  const { previewRef } = usePreviewElement();
  const { backgroundEffects, iconEffects } = storageValue;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        ref={previewRef}
        id="logo-preview"
        className="relative isolate flex aspect-square w-full max-w-138 items-center justify-center overflow-hidden"
        style={{
          borderRadius: storageValue.bgRounded,
          padding: storageValue.bgPadding,
        }}
      >
        <BackgroundRenderer
          background={storageValue.bgColor}
          gradientId={storageValue.bgGradientId}
          effects={backgroundEffects}
        />
        <div
          data-icon-layer
          className="relative z-10 flex items-center justify-center"
        >
          {iconEffects.outlineColor && iconEffects.outlineWidth > 0 ? (
            <span className="absolute">
              <Icon
                name={storageValue.icon}
                color={iconEffects.outlineColor}
                size={storageValue.iconSize}
                rotate={storageValue.iconRotate}
                effects={{
                  ...iconEffects,
                  fill: null,
                  shadows: [],
                  glowOpacity: 0,
                  strokeWidth:
                    iconEffects.strokeWidth + iconEffects.outlineWidth,
                }}
              />
            </span>
          ) : null}
          {iconEffects.duotoneColor && iconEffects.duotoneOpacity > 0 ? (
            <span
              className="absolute"
              style={{ opacity: iconEffects.duotoneOpacity }}
            >
              <Icon
                name={storageValue.icon}
                color={iconEffects.duotoneColor}
                size={storageValue.iconSize}
                rotate={storageValue.iconRotate}
                effects={{ ...iconEffects, shadows: [], glowOpacity: 0 }}
              />
            </span>
          ) : null}
          <Icon
            name={storageValue.icon}
            color={storageValue.iconColor}
            size={storageValue.iconSize}
            rotate={storageValue.iconRotate}
            effects={iconEffects}
          />
        </div>
      </div>
    </div>
  );
};
