import { expect, test } from "@playwright/test";
import { unzipSync } from "fflate";

const pngWidth = (bytes: Uint8Array) =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(16);

const readPngPixel = async (
  page: import("@playwright/test").Page,
  bytes: Buffer,
  x: number,
  y: number,
) =>
  page.evaluate(
    async ({ data, x, y }) => {
      const binary = atob(data);
      const encoded = Uint8Array.from(binary, (character) =>
        character.charCodeAt(0),
      );
      const image = await createImageBitmap(
        new Blob([encoded], { type: "image/png" }),
      );
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(image, 0, 0);
      return Array.from(context.getImageData(x, y, 1, 1).data);
    },
    { data: bytes.toString("base64"), x, y },
  );

const readZip = async (download: import("@playwright/test").Download) => {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);
  return unzipSync(new Uint8Array(Buffer.concat(chunks)));
};

test("selects an icon, restores it with undo, and saves a design", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#logo-preview svg").first()).toHaveAttribute(
    "fill",
    "none",
  );
  await page
    .getByRole("group", { name: "Properties" })
    .getByLabel("Icon")
    .click();
  await page.getByRole("textbox", { name: "Search icons" }).fill("camera");
  await page
    .getByRole("button", { name: "Select Camera", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("group", { name: "Properties" }).getByLabel("Icon"),
  ).toContainText("Face Slightly Smiling");

  await page.getByRole("button", { name: "Saved designs" }).click();
  await page.getByLabel("Preset name").fill("Camera draft");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Camera draft", exact: true }),
  ).toBeVisible();
});

test("exports selected PNG dimensions in a ZIP package", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Advanced export" }).click();
  await page.getByRole("button", { name: "Master" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export 2 PNGs as ZIP", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("icon-maker-export.zip");
  const png = Buffer.from((await readZip(download))["icon-2048.png"]);
  expect(pngWidth(png)).toBe(2048);
  expect((await readPngPixel(page, png, 100, 100))[3]).toBe(255);
});

test("quick export creates the current 1024 pixel PNG", async ({ page }) => {
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("icon-1024.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);
  expect(pngWidth(Buffer.concat(chunks))).toBe(1024);
});

test("exports transparent PNGs only when requested", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Advanced export" }).click();
  await page.getByLabel("Transparent icon only").check();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export 2 PNGs as ZIP", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  const zip = await readZip(download);
  expect(
    (
      await readPngPixel(
        page,
        Buffer.from(zip["icon-1024-transparent.png"]),
        100,
        100,
      )
    )[3],
  ).toBe(0);
});

test("imports only sanitized SVG icons", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "safe.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg viewBox="0 0 24 24" onclick="alert(1)"><script>alert(1)</script><path d="M0 0h24v24H0z"/></svg>',
    ),
  });
  await expect(page.getByText("Custom SVG")).toBeVisible();
  await page.getByRole("button", { name: "Remove uploaded icon" }).click();
  await expect(page.getByText("Face Slightly Smiling")).toBeVisible();
});

test("applies a bundled gradient to the preview", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Background" })
    .click();
  await page.getByRole("group", { name: "Colors" }).getByRole("button").click();
  await page.getByRole("tab", { name: "Gradient" }).click();
  await page
    .getByRole("button", { name: "Use gradient Sunrise Drift" })
    .click();
  await expect(
    page.locator("#logo-preview [data-gradient-renderer='true']"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Advanced export" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export 1 PNG as ZIP", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  const zip = await readZip(download);
  expect(
    (await readPngPixel(page, Buffer.from(zip["icon-1024.png"]), 100, 100))[3],
  ).toBe(255);
});

test("keeps the background picker in the document flow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Background" })
    .click();
  await page.getByRole("group", { name: "Colors" }).getByRole("button").click();
  await page.getByRole("tab", { name: "Gradient" }).click();

  const colorSection = page.getByRole("group", { name: "Colors" });
  const picker = colorSection.getByRole("tablist");
  await expect(picker).toBeVisible();
  const colorBounds = await colorSection.boundingBox();
  const pickerBounds = await picker.boundingBox();

  expect(colorBounds).not.toBeNull();
  expect(pickerBounds).not.toBeNull();
  expect(pickerBounds!.y).toBeGreaterThan(colorBounds!.y);
  expect(pickerBounds!.y + pickerBounds!.height).toBeLessThanOrEqual(
    colorBounds!.y + colorBounds!.height,
  );
  await expect(
    page.getByRole("button", { name: "Next gradient page" }),
  ).toBeVisible();
});

test("keeps the desktop preview fixed while background controls expand", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Background" }).first().click();

  const preview = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Live preview" }),
  });
  const initialBounds = await preview.boundingBox();
  await page.getByText("Background atmosphere", { exact: true }).click();
  const expandedBounds = await preview.boundingBox();

  expect(initialBounds).not.toBeNull();
  expect(expandedBounds).not.toBeNull();
  expect(expandedBounds!.y).toBe(initialBounds!.y);
  expect(expandedBounds!.height).toBe(initialBounds!.height);
});

test("opens preview-first mobile controls and keyboard shortcuts", async ({
  page,
}) => {
  const accessibilityWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "warning") return;
    const text = message.text();
    if (
      text.includes("Canvas2D: Multiple readback operations") ||
      text.includes("Blocked aria-hidden on an element")
    ) {
      accessibilityWarnings.push(text);
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Mobile editor controls" })
    .getByRole("button", { name: "Background" })
    .click();
  await expect(page.getByText("Background controls")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Shift+/");
  await expect(
    page.getByRole("heading", { name: "Keyboard shortcuts" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "More tools" }).click();
  await expect(page.getByRole("heading", { name: "More tools" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved designs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Advanced export" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "Mobile editor controls" })
    .getByRole("button", { name: "Export" })
    .click();
  await expect(page.getByRole("heading", { name: "Export" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download 1024 px PNG" }),
  ).toBeVisible();
  expect(accessibilityWarnings).toEqual([]);
});

test("restores a saved brand kit as an undoable editor state", async ({
  page,
}) => {
  await page.goto("/");
  const size = page.getByRole("slider", { name: "Size" });
  await size.press("ArrowRight");
  await expect(size).toHaveAttribute("aria-valuenow", "281");

  await page.getByRole("button", { name: "Brand kits" }).click();
  await page.getByLabel("Brand kit name").fill("Test kit");
  await page
    .getByRole("button", { name: "Save current design as kit", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset settings" }).click();
  await expect(size).toHaveAttribute("aria-valuenow", "280");

  await page.getByRole("button", { name: "Brand kits" }).click();
  await page.getByRole("button", { name: "Load Test kit" }).click();
  await expect(size).toHaveAttribute("aria-valuenow", "281");
});
