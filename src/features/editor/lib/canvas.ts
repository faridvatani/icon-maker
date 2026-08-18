export const CANVAS_TARGETS = [
  { size: 16, label: "16 px", description: "Tiny icon" },
  { size: 32, label: "32 px", description: "Favicon" },
  { size: 48, label: "48 px", description: "Browser icon" },
  { size: 180, label: "180 px", description: "iOS app icon" },
  { size: 192, label: "192 px", description: "Android app icon" },
  { size: 400, label: "400 px", description: "Profile image" },
  { size: 512, label: "512 px", description: "App icon" },
  { size: 1024, label: "1024 px", description: "High resolution" },
  { size: 1080, label: "1080 px", description: "Social profile" },
  { size: 2048, label: "2048 px", description: "Master" },
] as const;

export const CANVAS_PRESETS = CANVAS_TARGETS.map(({ size }) => size) as [
  number,
  ...number[],
];
export type CanvasSize = (typeof CANVAS_PRESETS)[number] | number;

export const getCanvasTarget = (size: number) =>
  CANVAS_TARGETS.find((target) => target.size === size);

export const isCanvasSize = (value: unknown): value is CanvasSize =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 16 &&
  value <= 4096;

export const normalizeCanvasSizes = (values: unknown): CanvasSize[] => {
  if (!Array.isArray(values)) return [1024];
  const unique = [...new Set(values.filter(isCanvasSize))].sort(
    (left, right) => left - right,
  );
  return unique.length ? unique : [1024];
};
