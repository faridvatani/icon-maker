import type { CSSProperties } from "react";
import { GRADIENTS_BY_ID } from "@/features/editor/data/gradients";
import type { BackgroundEffects } from "@/features/editor/lib/effects";
import type {
  BackgroundValue,
  GradientId,
} from "@/features/editor/lib/styleValues";
import { cn } from "@/lib/utils";

interface BackgroundRendererProps {
  background: BackgroundValue;
  gradientId: GradientId | null;
  effects: BackgroundEffects;
}

interface LayeredGradientProps {
  gradientId: string;
  className?: string;
  thumbnail?: boolean;
  effects?: BackgroundEffects;
}

const GRAIN_BACKGROUND =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.48%27/%3E%3C/svg%3E")';

const getBackgroundEffectStyle = (
  effects?: BackgroundEffects,
): CSSProperties => ({
  filter:
    [
      effects?.blur ? `blur(${effects.blur}px)` : "",
      effects?.distortion
        ? `contrast(${1 + effects.distortion * 0.35}) saturate(${1 + effects.distortion * 0.5})`
        : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined,
  transform: effects?.gradientRotate
    ? `scale(1.06) rotate(${effects.gradientRotate}deg)`
    : undefined,
  mixBlendMode: effects?.blendMode,
});

function GrainLayer({ opacity }: { opacity: number }) {
  if (!opacity) return null;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 mix-blend-overlay"
      style={{ backgroundImage: GRAIN_BACKGROUND, opacity }}
    />
  );
}

function SpotlightLayer({ effects }: { effects?: BackgroundEffects }) {
  if (!effects?.spotlightOpacity) return null;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at ${effects.spotlightX}% ${effects.spotlightY}%, rgba(255,255,255,${effects.spotlightOpacity}), transparent 46%)`,
      }}
    />
  );
}

function VignetteLayer({ effects }: { effects?: BackgroundEffects }) {
  if (!effects?.vignette) return null;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle, transparent 42%, rgba(0,0,0,${effects.vignette}) 100%)`,
      }}
    />
  );
}

function BackgroundEffectLayers({
  effects,
  grainOpacity,
  variant,
}: {
  effects?: BackgroundEffects;
  grainOpacity: number;
  variant: "gradient" | "solid";
}) {
  if (variant === "gradient") {
    return (
      <>
        <GrainLayer opacity={grainOpacity} />
        <SpotlightLayer effects={effects} />
        <VignetteLayer effects={effects} />
      </>
    );
  }

  return (
    <>
      <SpotlightLayer effects={effects} />
      <VignetteLayer effects={effects} />
      <GrainLayer opacity={grainOpacity} />
    </>
  );
}

export function LayeredGradient({
  gradientId,
  className,
  thumbnail = false,
  effects,
}: LayeredGradientProps) {
  const gradient = GRADIENTS_BY_ID.get(gradientId);

  if (!gradient) return null;

  const grainOpacity = Math.min(
    0.5,
    (gradient.grain ? 0.14 : 0) + (effects?.grain ?? 0) * 0.36,
  );

  return (
    <div
      data-background-layer
      aria-hidden="true"
      data-gradient-renderer="true"
      className={cn("absolute inset-0 isolate overflow-hidden", className)}
      style={{
        backgroundColor: gradient.base,
        ...getBackgroundEffectStyle(effects),
      }}
    >
      {gradient.layers.map((layer, index) => (
        <div
          key={`${gradient.id}-${index}`}
          className="absolute inset-[-12%]"
          style={{
            background: layer.background,
            backgroundSize: layer.backgroundSize,
            filter: layer.blur
              ? `blur(${Math.round(layer.blur * (thumbnail ? 0.35 : 1))}px)`
              : undefined,
            mixBlendMode: layer.blendMode as CSSProperties["mixBlendMode"],
            opacity: layer.opacity ?? 1,
          }}
        />
      ))}
      <BackgroundEffectLayers
        effects={effects}
        grainOpacity={grainOpacity}
        variant="gradient"
      />
    </div>
  );
}

export function BackgroundRenderer({
  background,
  gradientId,
  effects,
}: BackgroundRendererProps) {
  if (gradientId) {
    return <LayeredGradient gradientId={gradientId} effects={effects} />;
  }

  return (
    <>
      <div
        data-background-layer
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background, ...getBackgroundEffectStyle(effects) }}
      />
      <BackgroundEffectLayers
        effects={effects}
        grainOpacity={effects.grain * 0.36}
        variant="solid"
      />
    </>
  );
}
