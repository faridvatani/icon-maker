import {
  iconRegistry,
  type IconName,
} from "@/features/editor/data/iconRegistry";

const compatibilityIconAliases: Record<string, IconName> = {
  AlignCenter: "TextAlignCenter",
  AlignJustify: "TextAlignJustify",
  AlignLeft: "TextAlignStart",
  AlignRight: "TextAlignEnd",
  Angry: "FaceAngry",
  Annoyed: "FaceExpressionless",
  AreaChart: "ChartArea",
  ArrowDownRightSquare: "SquareArrowDownRight",
  ArrowLeftCircle: "CircleArrowLeft",
  ArrowLeftSquare: "SquareArrowLeft",
  ArrowRightCircle: "CircleArrowRight",
  ArrowRightSquare: "SquareArrowRight",
  ArrowUpCircle: "CircleArrowUp",
  ArrowUpLeftFromCircle: "CircleArrowOutUpLeft",
  ArrowUpLeftSquare: "SquareArrowUpLeft",
  ArrowUpSquare: "SquareArrowUp",
  Smile: "FaceSlightlySmiling",
};

export const resolveIconName = (name: string): IconName => {
  const resolvedName = compatibilityIconAliases[name] ?? name;
  return resolvedName in iconRegistry
    ? (resolvedName as IconName)
    : "CircleQuestionMark";
};
