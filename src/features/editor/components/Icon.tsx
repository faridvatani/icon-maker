import { lazy, Suspense } from "react";
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

const CatalogIcon = lazy(
  () => import("@/features/editor/components/CatalogIcon"),
);

interface IconProps {
  name: IconValue;
  color?: string;
  size?: number;
  rotate?: number;
}

const CustomIcon = ({
  name,
  color,
  size,
  rotate,
}: {
  name: CustomIconValue;
  color: string;
  size: number;
  rotate: number;
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
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}
    />
  );
};

const Icon = ({
  name,
  color = "currentColor",
  size = 24,
  rotate = 0,
}: IconProps) => {
  if (isCustomIconValue(name)) {
    return <CustomIcon name={name} color={color} size={size} rotate={rotate} />;
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
        />
      </Suspense>
    );
  }

  const LucideIcon = iconRegistry[resolveIconName(name)];

  return (
    <LucideIcon
      color={color}
      size={size}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
};

export default Icon;
