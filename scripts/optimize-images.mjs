import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const projectRoot = new URL("../", import.meta.url);
const sourceDirectory = new URL("public/media/originals/", projectRoot);
const outputDirectory = new URL("public/media/optimized/", projectRoot);
const contentFile = new URL("src/data/site-content.json", projectRoot);
const targetWidths = [480, 900, 1440, 1920];
const supportedExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);

await mkdir(outputDirectory, { recursive: true });

const siteContent = JSON.parse(await readFile(contentFile, "utf8"));
const imageRecords = new Map();
for (const page of siteContent.pages) {
  for (const image of page.images ?? []) {
    if (!imageRecords.has(image.local)) imageRecords.set(image.local, []);
    imageRecords.get(image.local).push(image);
  }
}
const files = (await readdir(sourceDirectory))
  .filter((file) => supportedExtensions.has(extname(file).toLowerCase()))
  .sort();

let generated = 0;
let reused = 0;
let dimensionsUpdated = 0;

async function optimize(file) {
  const input = join(sourceDirectory.pathname, file);
  const metadata = await sharp(input).metadata();
  const sourceWidth = metadata.autoOrient?.width ?? metadata.width;
  const sourceHeight = metadata.autoOrient?.height ?? metadata.height;

  if (!sourceWidth || !sourceHeight) return;

  const sourcePath = `/media/originals/${file}`;
  const records = imageRecords.get(sourcePath) ?? [];
  for (const imageRecord of records) {
    if (imageRecord.width === sourceWidth && imageRecord.height === sourceHeight) continue;
    imageRecord.width = sourceWidth;
    imageRecord.height = sourceHeight;
    dimensionsUpdated += 1;
  }

  const widths = targetWidths.filter((width) => width < sourceWidth);
  widths.push(Math.min(sourceWidth, targetWidths.at(-1)));

  const uniqueWidths = [...new Set(widths)];
  const stem = basename(file, extname(file));
  const sourceStats = await stat(input);
  const candidates = [];

  for (const width of uniqueWidths) {
    const outputName = `${stem}-${width}.webp`;
    const output = join(outputDirectory.pathname, outputName);
    let shouldGenerate = true;

    try {
      const outputStats = await stat(output);
      shouldGenerate = outputStats.mtimeMs < sourceStats.mtimeMs;
    } catch {
      // A missing output is generated below.
    }

    if (shouldGenerate) {
      await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({
          quality: width <= 480 ? 74 : 80,
          alphaQuality: 86,
          effort: 4,
          smartSubsample: true,
        })
        .toFile(output);
      generated += 1;
    } else {
      reused += 1;
    }

    candidates.push({
      src: `/media/optimized/${outputName}`,
      width,
    });
  }

}

const concurrency = Math.max(2, Math.min(6, Number(process.env.IMAGE_WORKERS) || 4));
let cursor = 0;

async function worker() {
  while (cursor < files.length) {
    const file = files[cursor];
    cursor += 1;
    await optimize(file);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
if (dimensionsUpdated > 0) {
  await writeFile(contentFile, `${JSON.stringify(siteContent, null, 2)}\n`);
}

console.log(
  `Optimized ${files.length} images: ${generated} generated, ${reused} reused, ${dimensionsUpdated} dimensions updated.`,
);
