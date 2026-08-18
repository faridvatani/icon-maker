import { expect, test, type Locator, type Page } from "@playwright/test";
import { unzipSync } from "fflate";

const runtimeIssues = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const issues: string[] = [];
  runtimeIssues.set(page, issues);
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      issues.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
});

test.afterEach(({ page }) => {
  expect(runtimeIssues.get(page) ?? []).toEqual([]);
});

const pngWidth = (bytes: Uint8Array) =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(16);
const pngHeight = (bytes: Uint8Array) =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(20);

const readDownload = async (download: import("@playwright/test").Download) => {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
};

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
  return unzipSync(new Uint8Array(await readDownload(download)));
};

const expectPreviewMatchesExport = async (page: Page) => {
  const preview = await page.locator("#logo-preview").screenshot({
    animations: "disabled",
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const exported = await readDownload(await downloadPromise);
  const sample = { x: 0.12, y: 0.12 };
  const previewPixel = await readPngPixel(
    page,
    preview,
    Math.floor(pngWidth(preview) * sample.x),
    Math.floor(pngHeight(preview) * sample.y),
  );
  const exportedPixel = await readPngPixel(
    page,
    exported,
    Math.floor(pngWidth(exported) * sample.x),
    Math.floor(pngHeight(exported) * sample.y),
  );

  for (let channel = 0; channel < 4; channel += 1) {
    expect(
      Math.abs(previewPixel[channel] - exportedPixel[channel]),
    ).toBeLessThanOrEqual(4);
  }
};

const expectFocusTrap = async (page: Page, modal: Locator) => {
  await page.keyboard.press("Shift+Tab");
  expect(
    await modal.evaluate((element) => element.contains(document.activeElement)),
  ).toBe(true);

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    expect(
      await modal.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
};

test("selects an icon, restores it with undo, and saves a design", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#logo-preview svg").first()).toHaveAttribute(
    "fill",
    "none",
  );
  await page.getByRole("button", { name: /Change icon/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search icons" }).fill("camera");
  await page
    .getByRole("button", { name: "Select Camera", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: /Change icon/ })).toContainText(
    "Face Slightly Smiling",
  );

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

test("preserves filenames and order for a representative larger export", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Advanced export" }).click();
  for (const target of ["32 px", "192 px", "512 px"]) {
    await page.getByRole("button", { name: new RegExp(`^${target}`) }).click();
  }
  await page.getByLabel("Transparent icon only").check();

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export 8 PNGs as ZIP", exact: true })
    .click();
  const zip = await readZip(await downloadPromise);

  expect(Object.keys(zip)).toEqual([
    "icon-32.png",
    "icon-32-transparent.png",
    "icon-192.png",
    "icon-192-transparent.png",
    "icon-512.png",
    "icon-512-transparent.png",
    "icon-1024.png",
    "icon-1024-transparent.png",
  ]);
  for (const [fileName, bytes] of Object.entries(zip)) {
    const expectedSize = Number(fileName.match(/icon-(\d+)/)?.[1]);
    expect(pngWidth(bytes)).toBe(expectedSize);
    expect(pngHeight(bytes)).toBe(expectedSize);
  }
});

test("rejects an unsafe export workload before rendering", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Advanced export" }).click();
  const customSize = page.getByLabel("Custom canvas size");

  for (let size = 20; size < 40; size += 1) {
    await customSize.fill(String(size));
    await page.getByRole("button", { name: "Add", exact: true }).click();
  }

  await page
    .getByRole("button", { name: "Export 21 PNGs as ZIP", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Export up to 20 PNGs at a time",
  );
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("uses accessible shadcn checkboxes for export backgrounds", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Advanced export" }).click();

  const currentBackground = page.getByRole("checkbox", {
    name: "Use current background",
  });
  await expect(currentBackground).toHaveAttribute("data-state", "checked");
  await currentBackground.press("Space");
  await expect(currentBackground).toHaveAttribute("data-state", "unchecked");
});

test("quick export creates the current 1024 pixel PNG", async ({ page }) => {
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("icon-1024.png");
  expect(pngWidth(await readDownload(download))).toBe(1024);
  await expect(page.getByRole("button", { name: "Export PNG" })).toBeVisible();
});

test("recalculates contrast after rapid color changes without console issues", async ({
  page,
}) => {
  await page.goto("/");
  const contrastResult = page.getByText(/Current color: .* worst-case/);
  await expect(contrastResult).toBeVisible();
  const initialResult = await contrastResult.textContent();

  await page.getByRole("group", { name: "Colors" }).getByRole("button").click();
  await page.getByRole("button", { name: "Use solid color #ff75c3" }).click();
  await page.getByRole("button", { name: "Use solid color #ffa647" }).click();
  await page.getByRole("button", { name: "Use solid color #09203f" }).click();

  await expect(contrastResult).toHaveText(initialResult ?? "");
});

test("keeps solid and gradient previews consistent with PNG export", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Editor sections" })
    .getByRole("button", { name: "Background" })
    .click();
  const backgroundEffects = page.locator(
    'section[aria-label="Background effects"]',
  );
  await backgroundEffects.locator("summary").click();
  await backgroundEffects
    .getByRole("slider", { name: "Spotlight 0", exact: true })
    .press("ArrowRight");
  await backgroundEffects
    .getByRole("slider", { name: "Vignette 0", exact: true })
    .press("ArrowRight");
  const colors = page.getByRole("group", { name: "Colors" });

  await colors.getByRole("button").first().click();
  await page.getByRole("button", { name: "Use solid color #ff75c3" }).click();
  await expectPreviewMatchesExport(page);

  await page.getByRole("tab", { name: "Gradient" }).click();
  await page
    .getByRole("button", { name: "Use gradient Sunrise Drift" })
    .click();
  await expectPreviewMatchesExport(page);
});

test("uses the shadcn reset confirmation dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("slider", { name: "Size" }).press("ArrowRight");
  await page.getByRole("button", { name: "Reset settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset all settings?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset all settings?" }),
  ).toHaveCount(0);
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

test("exposes one keyboard-accessible SVG import control", async ({ page }) => {
  await page.goto("/");

  const importButton = page.getByRole("button", { name: "Import SVG" });
  const fileInput = page.locator('input[type="file"]');

  await expect(importButton).toBeVisible();
  await expect(fileInput).toHaveAttribute("aria-hidden", "true");
  await expect(fileInput).toHaveAttribute("tabindex", "-1");
  await expect(page.getByRole("button", { name: "Home" })).toHaveCount(0);

  await importButton.focus();
  await page.keyboard.press("Tab");
  await expect(fileInput).not.toBeFocused();
});

test("keeps the editor usable when the icon library chunk fails", async ({
  baseURL,
  browser,
}) => {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route(/IconPickerDialog-.*\.js$/, (route) => route.abort());

  await page.goto(baseURL ?? "http://127.0.0.1:4173/icon-maker/");
  await page.getByRole("button", { name: /Change icon/ }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Could not load the icon library",
  );
  await expect(page.locator("#logo-preview")).toBeVisible();
  await page.getByRole("alert").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Live preview" }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  await context.close();
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
  const controls = page.locator("main > section").first();
  expect(
    await controls.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight === window.innerHeight,
      ),
    )
    .toBe(true);
});

test("keeps desktop controls free of page and horizontal overflow while switching panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const controls = page.locator("main > section").first();
  const sidebar = page.getByRole("navigation", { name: "Editor sections" });

  for (const panel of ["Background", "Icon", "Background", "Icon"]) {
    await sidebar.getByRole("button", { name: panel }).click();
    await expect
      .poll(() =>
        controls.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
  }

  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight,
    ),
  ).toBe(true);
});

test("keeps the tablet workspace contained without changing the editor layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Mobile editor controls" }),
  ).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Live preview" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.documentHeight).toBeLessThanOrEqual(
    dimensions.viewportHeight,
  );
  expect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth,
  );
});

test("returns focus to a dialog trigger after the dialog closes", async ({
  page,
}) => {
  await page.goto("/");
  const exportTrigger = page.getByRole("button", { name: "Advanced export" });

  await exportTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(exportTrigger).toBeFocused();
});

test("returns focus to the reset trigger after its alert closes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("slider", { name: "Size" }).press("ArrowRight");
  const trigger = page.getByRole("button", { name: "Reset settings" });

  await trigger.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("traps icon picker focus and restores the icon trigger after every close path", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Change icon/ });

  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Search icons")).toBeFocused();
  await expectFocusTrap(page, dialog);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByLabel("Search icons").fill("camera");
  await page
    .getByRole("button", { name: "Select Camera", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("traps mobile sheet focus and restores each sheet trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Mobile editor controls",
  });

  for (const name of ["Icon", "Background", "Export", "More tools"]) {
    const trigger = navigation.getByRole("button", { name, exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectFocusTrap(page, dialog);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test("suppresses editor shortcuts while a modal or editable control owns focus", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Saved designs" }).click();
  const presetName = page.getByLabel("Preset name");
  await presetName.fill("edit");
  await presetName.press("e");
  await expect(
    page.getByRole("heading", { name: "Advanced export" }),
  ).toHaveCount(0);

  await page.keyboard.press("Escape");
  await page.getByRole("slider", { name: "Size" }).press("ArrowRight");
  const resetTrigger = page.getByRole("button", { name: "Reset settings" });
  await resetTrigger.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Advanced export" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(resetTrigger).toBeFocused();

  for (const editable of [
    "input",
    "textarea",
    "select",
    "contenteditable",
    "textbox",
    "combobox",
  ]) {
    await page.evaluate((kind) => {
      const element =
        kind === "contenteditable"
          ? document.createElement("div")
          : kind === "textbox" || kind === "combobox"
            ? document.createElement("button")
            : document.createElement(kind);
      element.setAttribute("data-shortcut-test", kind);
      if (element instanceof HTMLDivElement) element.contentEditable = "true";
      if (kind === "textbox" || kind === "combobox") {
        element.setAttribute("role", kind);
      }
      document.body.append(element);
      element.focus();
    }, editable);
    await page.keyboard.press("e");
    await expect(
      page.getByRole("heading", { name: "Advanced export" }),
    ).toHaveCount(0);
  }

  await page.locator("#editor-main").focus();
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Advanced export" }),
  ).toBeVisible();
});

test("provides a keyboard skip link to the editor main content", async ({
  browserName,
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  const skipLink = page.getByRole("link", { name: "Skip to editor" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await skipLink.press("Enter");
  await expect(page.locator("#editor-main")).toBeFocused();
});

test("confirms destructive saved-design and brand-kit deletion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Saved designs" }).click();
  await page.getByLabel("Preset name").fill("Keep me");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const deletePreset = page.getByRole("button", { name: "Delete Keep me" });
  await deletePreset.click();
  await expect(page.getByRole("alertdialog")).toContainText("Keep me");
  await page.keyboard.press("Escape");
  await expect(deletePreset).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Keep me", exact: true }),
  ).toBeVisible();
  await deletePreset.click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete saved design" })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep me", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Brand kits" }).click();
  await page.getByLabel("Brand kit name").fill("Keep kit");
  await page
    .getByRole("button", { name: "Save current design as kit", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete Keep kit" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Keep kit");
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete brand kit" })
    .click();
  await expect(page.getByRole("button", { name: "Load Keep kit" })).toHaveCount(
    0,
  );
});

test("opens preview-first mobile controls and keyboard shortcuts", async ({
  page,
}) => {
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
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset settings" })
    .click();
  await expect(size).toHaveAttribute("aria-valuenow", "280");

  await page.getByRole("button", { name: "Brand kits" }).click();
  await page.getByRole("button", { name: "Load Test kit" }).click();
  await expect(size).toHaveAttribute("aria-valuenow", "281");
});
