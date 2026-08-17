import { expect, test } from "@playwright/test";

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

test("selects an icon, restores it with undo, and saves a preset", async ({
  page,
}) => {
  await page.goto("/");
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

  await page.getByRole("button", { name: "Presets" }).click();
  await page.getByLabel("Preset name").fill("Camera draft");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Camera draft", exact: true }),
  ).toBeVisible();
});

test("exports selected PNG dimensions", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await page.getByRole("button", { name: "2048px" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download PNG", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);
  const png = Buffer.concat(chunks);
  expect(pngWidth(png)).toBe(2048);
  expect((await readPngPixel(page, png, 100, 100))[3]).toBe(255);
});

test("exports transparent PNGs only when requested", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await page.getByLabel("Transparent icon only").check();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download PNG", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);

  expect((await readPngPixel(page, Buffer.concat(chunks), 100, 100))[3]).toBe(
    0,
  );
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

  await page.getByRole("button", { name: "Download PNG" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download PNG", exact: true })
    .last()
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);

  expect((await readPngPixel(page, Buffer.concat(chunks), 100, 100))[3]).toBe(
    255,
  );
});

test("keeps the background picker inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Background" })
    .click();
  await page.getByRole("group", { name: "Colors" }).getByRole("button").click();
  await page.getByRole("tab", { name: "Gradient" }).click();

  const picker = page.locator("[data-radix-popper-content-wrapper]");
  await expect(picker).toBeVisible();
  const bounds = await picker.boundingBox();

  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(16);
  expect(bounds!.y).toBeGreaterThanOrEqual(16);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1264);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(784);
  await expect(
    page.getByRole("button", { name: "Next gradient page" }),
  ).toBeVisible();
});
