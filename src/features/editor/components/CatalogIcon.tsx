import { icons } from "lucide-react";
import type { CSSProperties } from "react";
import type { CatalogIconName } from "@/features/editor/lib/iconTypes";

interface CatalogIconProps {
  name: CatalogIconName;
  color?: string;
  size?: number;
  rotate?: number;
  fill?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}

export default function CatalogIcon({
  name,
  color = "currentColor",
  size = 24,
  rotate = 0,
  fill,
  strokeWidth,
  style,
  className,
}: CatalogIconProps) {
  const IconComponent = icons[name];
  const fillProps = fill ? { fill } : {};
  return (
    <IconComponent
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
      {...fillProps}
    />
  );
}
