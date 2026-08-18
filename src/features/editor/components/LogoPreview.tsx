import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import Icon from "@/features/editor/components/Icon";
import {
  GRAIN_BACKGROUND,
  LayeredGradient,
} from "@/features/editor/components/LayeredGradient";

export const LogoPreview = () => {
  const { storageValue } = useStorage();
  const { backgroundEffects, iconEffects } = storageValue;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        id="logo-preview"
        className="relative isolate flex aspect-square w-full max-w-138 items-center justify-center overflow-hidden"
        style={{
          borderRadius: storageValue.bgRounded,
          padding: storageValue.bgPadding,
        }}
      >
        {!storageValue.bgGradientId ? (
          <>
            <div
              data-background-layer
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: storageValue.bgColor,
                filter:
                  [
                    backgroundEffects.blur
                      ? `blur(${backgroundEffects.blur}px)`
                      : "",
                    backgroundEffects.distortion
                      ? `contrast(${1 + backgroundEffects.distortion * 0.35}) saturate(${1 + backgroundEffects.distortion * 0.5})`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined,
                transform: backgroundEffects.gradientRotate
                  ? `scale(1.06) rotate(${backgroundEffects.gradientRotate}deg)`
                  : undefined,
                mixBlendMode: backgroundEffects.blendMode,
              }}
            />
            {backgroundEffects.spotlightOpacity ? (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at ${backgroundEffects.spotlightX}% ${backgroundEffects.spotlightY}%, rgba(255,255,255,${backgroundEffects.spotlightOpacity}), transparent 46%)`,
                }}
              />
            ) : null}
            {backgroundEffects.vignette ? (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle, transparent 42%, rgba(0,0,0,${backgroundEffects.vignette}) 100%)`,
                }}
              />
            ) : null}
            {backgroundEffects.grain ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 mix-blend-overlay"
                style={{
                  backgroundImage: GRAIN_BACKGROUND,
                  opacity: backgroundEffects.grain * 0.36,
                }}
              />
            ) : null}
          </>
        ) : null}
        {storageValue.bgGradientId ? (
          <LayeredGradient
            gradientId={storageValue.bgGradientId}
            effects={backgroundEffects}
          />
        ) : null}
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
