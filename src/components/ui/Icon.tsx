import React from "react";
import { icons } from "lucide-react";
import { resolveIconName } from "@/lib/iconConstants";

interface IconProps {
  name: string;
  color?: string;
  size?: number;
  rotate?: number;
}

const Icon: React.FC<IconProps> = ({
  name,
  color = "currentColor",
  size = 24,
  rotate = 0,
}) => {
  const LucideIcon = icons[resolveIconName(name)];

  return (
    <LucideIcon
      color={color}
      size={size}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
};

export default Icon;
