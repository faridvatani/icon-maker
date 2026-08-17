// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { sanitizeSvgIcon } from "@/features/editor/lib/sanitizeSvg";

describe("sanitizeSvgIcon", () => {
  it("keeps safe vector content and removes executable or remote content", () => {
    const result = sanitizeSvgIcon(
      '<svg viewBox="0 0 24 24" onclick="alert(1)"><script>alert(1)</script><image href="https://bad.example/icon.png"/><path d="M0 0h24v24H0z" fill="#000"/></svg>',
    );

    expect(result.svg).toContain("<path");
    expect(result.svg).not.toMatch(/script|onclick|image|https:/i);
  });

  it("rejects non-SVG content", () => {
    expect(() => sanitizeSvgIcon("<html></html>")).toThrow("valid SVG");
  });
});
