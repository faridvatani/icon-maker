import { lazy, Suspense, type CSSProperties } from "react";
import { resolveIconName } from "@/features/editor/data/iconConstants";
import { iconRegistry } from "@/features/editor/data/iconRegistry";
import {
  getCatalogIconName,
  isCustomIconValue,
  isCatalogIconValue,
  type CustomIconValue,
  type IconValue,
} from "@/features/editor/lib/iconTypes";
import { useCustomIcon } from "@/features/editor/hooks/useCustomIcon";
import {
  defaultIconEffects,
  type IconEffects,
} from "@/features/editor/lib/effects";

const CatalogIcon = lazy(
  () => import("@/features/editor/components/CatalogIcon"),
);

interface IconProps {
  name: IconValue;
  color?: string;
  size?: number;
  rotate?: number;
  effects?: IconEffects;
}

const effectStyle = (effects: IconEffects): CSSProperties => ({
  opacity: effects.opacity,
  mixBlendMode: effects.blendMode,
  filter: [
    ...effects.shadows.map(
      (shadow) =>
        `drop-shadow(${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}${Math.round(
          shadow.opacity * 255,
        )
          .toString(16)
          .padStart(2, "0")})`,
    ),
    effects.glowColor && effects.glowOpacity > 0
      ? `drop-shadow(0 0 ${effects.glowBlur}px ${effects.glowColor}${Math.round(
          effects.glowOpacity * 255,
        )
          .toString(16)
          .padStart(2, "0")})`
      : "",
  ]
    .filter(Boolean)
    .join(" "),
});

const CustomIcon = ({
  name,
  color,
  size,
  rotate,
  effects,
}: {
  name: CustomIconValue;
  color: string;
  size: number;
  rotate: number;
  effects: IconEffects;
}) => {
  const asset = useCustomIcon(name);
  if (!asset) {
    return (
      <span
        aria-label="Custom icon unavailable"
        className="inline-block rounded-sm border border-current/30"
        style={{
          width: size,
          height: size,
          color,
          transform: `rotate(${rotate}deg)`,
          ...effectStyle(effects),
        }}
      />
    );
  }
  return (
    <img
      src={asset.dataUrl}
      alt={asset.name}
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        ...effectStyle(effects),
      }}
    />
  );
};

const Icon = ({
  name,
  color = "currentColor",
  size = 24,
  rotate = 0,
  effects,
}: IconProps) => {
  const iconEffects = effects ?? defaultIconEffects;
  const fillProps = iconEffects.fill ? { fill: iconEffects.fill } : {};
  if (isCustomIconValue(name)) {
    return (
      <CustomIcon
        name={name}
        color={color}
        size={size}
        rotate={rotate}
        effects={iconEffects}
      />
    );
  }

  if (isCatalogIconValue(name)) {
    return (
      <Suspense
        fallback={
          <span
            aria-hidden="true"
            style={{ display: "inline-block", width: size, height: size }}
          />
        }
      >
        <CatalogIcon
          name={getCatalogIconName(name)}
          color={color}
          size={size}
          rotate={rotate}
          strokeWidth={iconEffects.strokeWidth}
          style={effectStyle(iconEffects)}
          {...fillProps}
        />
      </Suspense>
    );
  }

  const LucideIcon = iconRegistry[resolveIconName(name)];

  return (
    <LucideIcon
      color={color}
      size={size}
      strokeWidth={iconEffects.strokeWidth}
      style={{ transform: `rotate(${rotate}deg)`, ...effectStyle(iconEffects) }}
      {...fillProps}
    />
  );
};

export default Icon;
