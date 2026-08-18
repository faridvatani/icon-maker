import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  defaultIconEffects,
  type BackgroundEffects,
  IconEffects,
  IconShadow,
} from "@/features/editor/lib/effects";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
  onCommit: () => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
  onCommit,
}: SliderFieldProps) {
  const id = `effect-${label.toLowerCase().replace(/ /g, "-")}`;
  return (
    <div className="grid gap-2">
      <div
        id={id}
        className="flex items-center justify-between text-xs font-medium"
      >
        <span>{label}</span>
        <span className="tabular-nums">
          {Math.round(value * 100) / 100}
          {suffix}
        </span>
      </div>
      <Slider
        aria-labelledby={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        onValueCommit={onCommit}
      />
    </div>
  );
}

function EffectSection({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-lg border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-medium marker:hidden">
        <span>{title}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {summary}
        </span>
      </summary>
      <div className="grid gap-4 border-t p-3">{children}</div>
    </details>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs font-medium">
      {label}
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          aria-label={`Enable ${label}`}
          className="size-5 cursor-pointer rounded border-input accent-foreground"
          checked={Boolean(value)}
          onChange={(event) =>
            onChange(event.target.checked ? "#000000" : null)
          }
        />
        {value ? (
          <input
            type="color"
            aria-label={`${label} color`}
            value={value}
            className="size-7 cursor-pointer rounded border bg-transparent p-0.5"
            onChange={(event) => onChange(event.target.value)}
          />
        ) : null}
      </span>
    </label>
  );
}

function BlendMode({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium">
      Blend mode
      <select
        aria-label={label}
        value={value}
        className="h-9 rounded-md border bg-background px-2 text-sm"
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="normal">Normal</option>
        <option value="multiply">Multiply</option>
        <option value="screen">Screen</option>
        <option value="overlay">Overlay</option>
      </select>
    </label>
  );
}

interface IconEffectsControlsProps {
  value: IconEffects;
  onPreview: (value: IconEffects) => void;
  onUpdate: (value: IconEffects) => void;
  onCommit: () => void;
}

export function IconEffectsControls({
  value,
  onPreview,
  onUpdate,
  onCommit,
}: IconEffectsControlsProps) {
  const update = (patch: Partial<IconEffects>) =>
    onUpdate({ ...value, ...patch });
  const preview = (patch: Partial<IconEffects>) =>
    onPreview({ ...value, ...patch });
  const stylingCount =
    [value.fill, value.outlineColor, value.duotoneColor].filter(Boolean)
      .length + (value.strokeWidth !== defaultIconEffects.strokeWidth ? 1 : 0);
  const atmosphereCount =
    value.shadows.length + (value.glowColor && value.glowOpacity ? 1 : 0);
  const updateShadow = (index: number, patch: Partial<IconShadow>) =>
    update({
      shadows: value.shadows.map((shadow, shadowIndex) =>
        shadowIndex === index ? { ...shadow, ...patch } : shadow,
      ),
    });
  const previewShadow = (index: number, patch: Partial<IconShadow>) =>
    preview({
      shadows: value.shadows.map((shadow, shadowIndex) =>
        shadowIndex === index ? { ...shadow, ...patch } : shadow,
      ),
    });
  return (
    <section className="grid gap-3" aria-label="Icon effects">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium">Effects</h2>
        <span className="text-xs text-muted-foreground">
          {stylingCount + atmosphereCount
            ? `${stylingCount + atmosphereCount} active`
            : "None active"}
        </span>
      </div>
      <SliderField
        label="Opacity"
        value={value.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(opacity) => preview({ opacity })}
        onCommit={onCommit}
      />
      <EffectSection
        title="Icon styling"
        summary={
          stylingCount ? `${stylingCount} active` : "Fill, outline, duotone"
        }
      >
        <div className="grid gap-3">
          <ColorField
            label="Fill"
            value={value.fill}
            onChange={(fill) => update({ fill })}
          />
          <ColorField
            label="Outline"
            value={value.outlineColor}
            onChange={(outlineColor) => update({ outlineColor })}
          />
          <ColorField
            label="Duotone"
            value={value.duotoneColor}
            onChange={(duotoneColor) => update({ duotoneColor })}
          />
        </div>
        <SliderField
          label="Stroke width"
          value={value.strokeWidth}
          min={0.5}
          max={8}
          step={0.5}
          onChange={(strokeWidth) => preview({ strokeWidth })}
          onCommit={onCommit}
        />
        <SliderField
          label="Outline width"
          value={value.outlineWidth}
          min={0}
          max={12}
          onChange={(outlineWidth) => preview({ outlineWidth })}
          onCommit={onCommit}
        />
        <SliderField
          label="Duotone opacity"
          value={value.duotoneOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(duotoneOpacity) => preview({ duotoneOpacity })}
          onCommit={onCommit}
        />
        <BlendMode
          label="Icon blend mode"
          value={value.blendMode}
          onChange={(blendMode) =>
            update({ blendMode: blendMode as IconEffects["blendMode"] })
          }
        />
      </EffectSection>
      <EffectSection
        title="Shadows & glow"
        summary={atmosphereCount ? `${atmosphereCount} active` : "Add depth"}
      >
        <ColorField
          label="Glow"
          value={value.glowColor}
          onChange={(glowColor) => update({ glowColor })}
        />
        <SliderField
          label="Glow blur"
          value={value.glowBlur}
          min={0}
          max={96}
          onChange={(glowBlur) => preview({ glowBlur })}
          onCommit={onCommit}
        />
        <SliderField
          label="Glow opacity"
          value={value.glowOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(glowOpacity) => preview({ glowOpacity })}
          onCommit={onCommit}
        />
        <div className="grid gap-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Shadows</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={value.shadows.length === 3}
              onClick={() =>
                update({
                  shadows: [
                    ...value.shadows,
                    { color: "#000000", x: 0, y: 8, blur: 16, opacity: 0.25 },
                  ],
                })
              }
            >
              <Plus className="size-3" /> Add
            </Button>
          </div>
          {value.shadows.map((shadow, index) => (
            <div key={index} className="grid gap-2 rounded-md bg-muted/50 p-2">
              <div className="flex items-center justify-between text-xs">
                <span>Shadow {index + 1}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-6"
                  aria-label={`Remove shadow ${index + 1}`}
                  onClick={() =>
                    update({
                      shadows: value.shadows.filter(
                        (_, shadowIndex) => shadowIndex !== index,
                      ),
                    })
                  }
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <input
                aria-label={`Shadow ${index + 1} color`}
                type="color"
                value={shadow.color}
                className="h-7 w-full"
                onChange={(event) =>
                  updateShadow(index, { color: event.target.value })
                }
              />
              <SliderField
                label={`Shadow ${index + 1} X`}
                value={shadow.x}
                min={-48}
                max={48}
                onChange={(x) => previewShadow(index, { x })}
                onCommit={onCommit}
              />
              <SliderField
                label={`Shadow ${index + 1} Y`}
                value={shadow.y}
                min={-48}
                max={48}
                onChange={(y) => previewShadow(index, { y })}
                onCommit={onCommit}
              />
              <SliderField
                label={`Shadow ${index + 1} blur`}
                value={shadow.blur}
                min={0}
                max={96}
                onChange={(blur) => previewShadow(index, { blur })}
                onCommit={onCommit}
              />
              <SliderField
                label={`Shadow ${index + 1} opacity`}
                value={shadow.opacity}
                min={0}
                max={1}
                step={0.05}
                onChange={(opacity) => previewShadow(index, { opacity })}
                onCommit={onCommit}
              />
            </div>
          ))}
        </div>
      </EffectSection>
    </section>
  );
}

interface BackgroundEffectsControlsProps {
  value: BackgroundEffects;
  onPreview: (value: BackgroundEffects) => void;
  onUpdate: (value: BackgroundEffects) => void;
  onCommit: () => void;
}

export function BackgroundEffectsControls({
  value,
  onPreview,
  onUpdate,
  onCommit,
}: BackgroundEffectsControlsProps) {
  const update = (patch: Partial<BackgroundEffects>) =>
    onUpdate({ ...value, ...patch });
  const preview = (patch: Partial<BackgroundEffects>) =>
    onPreview({ ...value, ...patch });
  const activeCount =
    [
      value.blur,
      value.grain,
      value.gradientRotate,
      value.spotlightOpacity,
      value.vignette,
      value.distortion,
    ].filter(Boolean).length + (value.blendMode !== "normal" ? 1 : 0);
  return (
    <section className="grid gap-3" aria-label="Background effects">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium">Effects</h2>
        <span className="text-xs text-muted-foreground">
          {activeCount ? `${activeCount} active` : "None active"}
        </span>
      </div>
      <EffectSection
        title="Background atmosphere"
        summary={
          activeCount ? `${activeCount} active` : "Blur, grain, spotlight"
        }
      >
        <SliderField
          label="Blur"
          value={value.blur}
          min={0}
          max={32}
          onChange={(blur) => preview({ blur })}
          onCommit={onCommit}
        />
        <SliderField
          label="Grain"
          value={value.grain}
          min={0}
          max={1}
          step={0.05}
          onChange={(grain) => preview({ grain })}
          onCommit={onCommit}
        />
        <SliderField
          label="Gradient rotation"
          value={value.gradientRotate}
          min={0}
          max={360}
          suffix="°"
          onChange={(gradientRotate) => preview({ gradientRotate })}
          onCommit={onCommit}
        />
        <SliderField
          label="Spotlight X"
          value={value.spotlightX}
          min={0}
          max={100}
          suffix="%"
          onChange={(spotlightX) => preview({ spotlightX })}
          onCommit={onCommit}
        />
        <SliderField
          label="Spotlight Y"
          value={value.spotlightY}
          min={0}
          max={100}
          suffix="%"
          onChange={(spotlightY) => preview({ spotlightY })}
          onCommit={onCommit}
        />
        <SliderField
          label="Spotlight"
          value={value.spotlightOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(spotlightOpacity) => preview({ spotlightOpacity })}
          onCommit={onCommit}
        />
        <SliderField
          label="Vignette"
          value={value.vignette}
          min={0}
          max={1}
          step={0.05}
          onChange={(vignette) => preview({ vignette })}
          onCommit={onCommit}
        />
        <SliderField
          label="Distortion"
          value={value.distortion}
          min={0}
          max={1}
          step={0.05}
          onChange={(distortion) => preview({ distortion })}
          onCommit={onCommit}
        />
        <BlendMode
          label="Background blend mode"
          value={value.blendMode}
          onChange={(blendMode) =>
            update({ blendMode: blendMode as BackgroundEffects["blendMode"] })
          }
        />
      </EffectSection>
    </section>
  );
}
