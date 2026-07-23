import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../content/archive/manifest.json", import.meta.url), "utf8"));

test("desktop homepage and navigation are fully interactive", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Spaces,/ })).toBeVisible();
  await expect(page.locator(".featured-project")).toHaveCount(3);
  await expect.poll(async () => page.locator(".featured-project img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("link", { name: /Projects/ }).first().click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.getByRole("heading", { name: "Places with presence." })).toBeVisible();
  await expect(page.locator(".project-tile").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("project, service, journal, and contact page families render", async ({ page }) => {
  const paths = [
    "/project/luxury-villa-sotogrande/",
    "/services/bespoke-joinery/",
    "/2025/10/09/bring-warmth-to-your-home-this-autumn/",
    "/about/",
    "/our-creativity/",
    "/contact/",
  ];

  for (const path of paths) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText("This room is still being imagined");
  }

  await page.goto("/contact/");
  await page.getByLabel("Name").fill("Studio Test");
  await page.getByLabel("Email").fill("studio@example.com");
  await page.getByLabel("What are you imagining?").fill("A complete villa interior.");
  await page.getByRole("button", { name: /Send your enquiry/ }).click();
  await expect(page.getByRole("heading", { name: "Your project is on our radar." })).toBeVisible();
});

test("mobile layout has no horizontal overflow and menu remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: /Contact/ }).first()).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
});

test("every archived route resolves to a designed page", async ({ page }) => {
  for (const entry of manifest.pages) {
    await page.goto(entry.path, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main")).not.toContainText("This room is still being imagined");
  }
});
