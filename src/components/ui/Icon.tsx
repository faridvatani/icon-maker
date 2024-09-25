import React from "react";
import { icons } from "lucide-react";

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
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;

  return (
    <LucideIcon
      color={color}
      size={size}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
};

export default Icon;
