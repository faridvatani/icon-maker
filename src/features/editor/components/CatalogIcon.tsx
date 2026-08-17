import { icons } from "lucide-react";
import type { CatalogIconName } from "@/features/editor/lib/iconTypes";

interface CatalogIconProps {
  name: CatalogIconName;
  color?: string;
  size?: number;
  rotate?: number;
  className?: string;
}

export default function CatalogIcon({
  name,
  color = "currentColor",
  size = 24,
  rotate = 0,
  className,
}: CatalogIconProps) {
  const IconComponent = icons[name];
  return (
    <IconComponent
      color={color}
      size={size}
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}
