const MAX_SVG_BYTES = 250 * 1024;
const ALLOWED_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "rect",
  "title",
  "desc",
]);
const ALLOWED_ATTRIBUTES = new Set([
  "viewbox",
  "width",
  "height",
  "fill",
  "fill-rule",
  "clip-rule",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "x2",
  "y1",
  "y2",
  "points",
  "transform",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  "preserveaspectratio",
  "role",
  "aria-label",
]);

export interface SanitizedSvgIcon {
  svg: string;
  dataUrl: string;
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const toDataUrl = (svg: string) =>
  `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(svg))}`;

export function sanitizeSvgIcon(source: string): SanitizedSvgIcon {
  if (new TextEncoder().encode(source).byteLength > MAX_SVG_BYTES) {
    throw new Error("SVG files must be 250 KB or smaller");
  }

  const document = new DOMParser().parseFromString(source, "image/svg+xml");
  if (document.querySelector("parsererror")) {
    throw new Error("Choose a valid SVG file");
  }

  const root = document.documentElement;
  if (root.localName.toLowerCase() !== "svg") {
    throw new Error("Choose a valid SVG file");
  }

  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    if (!ALLOWED_ELEMENTS.has(element.localName.toLowerCase())) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const isUnsafe =
        /(?:javascript:|data:|https?:|url\s*\()/i.test(value) ||
        name.startsWith("on") ||
        name === "style" ||
        !ALLOWED_ATTRIBUTES.has(name);
      if (isUnsafe) element.removeAttribute(attribute.name);
    }
  }

  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  root.removeAttribute("width");
  root.removeAttribute("height");
  if (!root.hasAttribute("viewBox")) root.setAttribute("viewBox", "0 0 24 24");

  const svg = new XMLSerializer().serializeToString(root);
  return { svg, dataUrl: toDataUrl(svg) };
}
