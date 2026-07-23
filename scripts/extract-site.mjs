import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { load } from "cheerio";

const ORIGIN = "https://www.originalsinteriors.com";
const PROJECT_ROOT = new URL("../", import.meta.url).pathname;
const ARCHIVE_DIR = join(PROJECT_ROOT, "content", "archive");
const PAGE_DIR = join(ARCHIVE_DIR, "pages");
const MEDIA_DIR = join(PROJECT_ROOT, "public", "media", "originals");
const DATA_DIR = join(PROJECT_ROOT, "src", "data");
const SITEMAPS = ["page-sitemap.xml", "post-sitemap.xml", "avada_portfolio-sitemap.xml"];
const USER_AGENT = "Mozilla/5.0 (compatible; OriginalsInteriorsRedesign/1.0; +https://www.originalsinteriors.com/)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchResponse(url, attempts = 3) {
  let error;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,application/xml,image/avif,image/webp,*/*" },
        redirect: "follow",
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (caught) {
      error = caught;
      if (attempt < attempts) await sleep(attempt * 600);
    }
  }
  throw new Error(`Unable to fetch ${url}: ${error?.message ?? "unknown error"}`);
}

async function fetchText(url) {
  return (await fetchResponse(url)).text();
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function cleanText(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteUrl(value, pageUrl) {
  if (!value || value.startsWith("data:")) return null;
  const cleaned = decodeXml(value.trim().replace(/^['"]|['"]$/g, ""));
  try {
    const url = new URL(cleaned.startsWith("//") ? `https:${cleaned}` : cleaned, pageUrl);
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function largestSrcset(srcset, pageUrl) {
  if (!srcset) return null;
  const candidates = srcset
    .split(",")
    .map((part) => {
      const [url, width = "0w"] = part.trim().split(/\s+/);
      return { url: absoluteUrl(url, pageUrl), width: Number.parseInt(width, 10) || 0 };
    })
    .filter((item) => item.url)
    .sort((a, b) => b.width - a.width);
  return candidates[0]?.url ?? null;
}

function pageKind(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/services/")) return "service";
  if (pathname.startsWith("/portfolio/")) return "portfolio-index";
  if (pathname === "/blog/") return "blog-index";
  if (/\/\d{4}\//.test(pathname)) return "article";
  return "page";
}

function safeSlug(pageUrl) {
  const pathname = new URL(pageUrl).pathname.replace(/^\/+|\/+$/g, "");
  return (pathname || "home").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function extractPage(html, pageUrl, sitemapName) {
  const $ = load(html);
  $("script,style,noscript,template,iframe,form,.fusion-header-wrapper,.fusion-footer,.fusion-footer-widget-area,.fusion-sliding-bar-wrapper,.to-top-container,.awb-menu,.fusion-main-menu,.fusion-mobile-menu-design-modern,.privacy-bar,.cky-consent-container").remove();

  const root = $("#main .post-content").first().length
    ? $("#main .post-content").first()
    : $("main").first().length
      ? $("main").first()
      : $("#main").first().length
        ? $("#main").first()
        : $("body");

  const blocks = [];
  root.find("h1,h2,h3,h4,p,blockquote,li").each((_, element) => {
    const node = $(element);
    if (node.parents("nav,footer,header,form").length) return;
    const text = cleanText(node.text());
    if (text.length < 2 || text === "Loading..." || text === "Go to Top") return;
    const tag = element.tagName.toLowerCase();
    blocks.push({ type: tag === "li" ? "list-item" : tag, text });
  });

  const imageCandidates = [];
  $("img").each((_, element) => {
    const node = $(element);
    const best = largestSrcset(node.attr("srcset"), pageUrl)
      ?? absoluteUrl(node.attr("data-lazyload"), pageUrl)
      ?? absoluteUrl(node.attr("data-src"), pageUrl)
      ?? absoluteUrl(node.attr("src"), pageUrl);
    if (!best || !best.includes("/wp-content/uploads/")) return;
    imageCandidates.push({
      remote: best,
      alt: cleanText(node.attr("alt") || node.attr("title") || "Originals Interiors project detail"),
      width: Number(node.attr("width")) || null,
      height: Number(node.attr("height")) || null,
    });
  });

  const htmlUrls = html.match(/url\(([^)]+)\)/g) ?? [];
  htmlUrls.forEach((match) => {
    const remote = absoluteUrl(match.slice(4, -1), pageUrl);
    if (remote?.includes("/wp-content/uploads/") && /\.(?:avif|webp|jpe?g|png|gif|svg)(?:\?|$)/i.test(remote)) {
      imageCandidates.push({ remote, alt: "Originals Interiors project atmosphere", width: null, height: null });
    }
  });

  const ogImage = absoluteUrl($("meta[property='og:image']").attr("content"), pageUrl);
  if (ogImage?.includes("/wp-content/uploads/")) {
    imageCandidates.unshift({ remote: ogImage, alt: cleanText($("meta[property='og:title']").attr("content") || "Originals Interiors"), width: null, height: null });
  }

  const title = cleanText(
    $("meta[property='og:title']").attr("content")
      || root.find("h1").first().text()
      || $("title").text()
      || "Originals Interiors",
  ).replace(/\s*[-|]\s*Originals Interiors.*$/i, "");

  const description = cleanText(
    $("meta[name='description']").attr("content")
      || blocks.find((block) => block.type === "p")?.text
      || "",
  );
  const pathname = new URL(pageUrl).pathname;

  return {
    id: safeSlug(pageUrl),
    url: pageUrl,
    path: pathname,
    sitemap: sitemapName,
    kind: sitemapName === "avada_portfolio-sitemap.xml" ? "project" : pageKind(pathname),
    title,
    description,
    blocks: uniqueBy(blocks, (block) => `${block.type}:${block.text}`),
    images: uniqueBy(imageCandidates, (image) => image.remote),
  };
}

function fileNameFor(remote) {
  const url = new URL(remote);
  const extension = extname(url.pathname).toLowerCase() || ".jpg";
  const rawBase = basename(url.pathname, extension).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "image";
  const hash = createHash("sha1").update(remote).digest("hex").slice(0, 9);
  return `${rawBase}-${hash}${extension}`;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function downloadMedia(media) {
  const fileName = fileNameFor(media.remote);
  const target = join(MEDIA_DIR, fileName);
  try {
    const response = await fetchResponse(media.remote, 2);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(target, buffer);
    return { ...media, local: `/media/originals/${fileName}`, bytes: buffer.byteLength, status: "downloaded" };
  } catch (error) {
    return { ...media, local: media.remote, bytes: 0, status: "remote-fallback", error: error.message };
  }
}

async function main() {
  await Promise.all([mkdir(PAGE_DIR, { recursive: true }), mkdir(MEDIA_DIR, { recursive: true }), mkdir(DATA_DIR, { recursive: true })]);

  const sitemapDocuments = await mapLimit(SITEMAPS, 3, async (name) => ({ name, xml: await fetchText(`${ORIGIN}/${name}`) }));
  const indexed = sitemapDocuments.flatMap(({ name, xml }) => {
    const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
      const entry = match[1];
      const location = decodeXml(entry.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "");
      const imageUrls = [...entry.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((image) => decodeXml(image[1]));
      return { name, location, imageUrls };
    });
    return urls.filter((entry) => entry.location.startsWith(ORIGIN));
  });

  const uniquePages = uniqueBy(indexed, (entry) => entry.location);
  console.log(`Indexed pages: ${uniquePages.length}`);

  const pages = await mapLimit(uniquePages, 5, async (entry, index) => {
    console.log(`[page ${index + 1}/${uniquePages.length}] ${entry.location}`);
    const html = await fetchText(entry.location);
    await writeFile(join(PAGE_DIR, `${safeSlug(entry.location)}.html`), html);
    const page = extractPage(html, entry.location, entry.name);
    entry.imageUrls.forEach((remote) => page.images.push({ remote, alt: `${page.title} image`, width: null, height: null }));
    page.images = uniqueBy(page.images, (image) => image.remote);
    return page;
  });

  const media = uniqueBy(pages.flatMap((page) => page.images), (image) => image.remote);
  console.log(`Unique media: ${media.length}`);
  const downloaded = await mapLimit(media, 6, async (item, index) => {
    if ((index + 1) % 20 === 0 || index === 0) console.log(`[media ${index + 1}/${media.length}] ${item.remote}`);
    return downloadMedia(item);
  });
  const mediaByRemote = new Map(downloaded.map((item) => [item.remote, item]));
  pages.forEach((page) => {
    page.images = page.images.map((image) => mediaByRemote.get(image.remote) ?? image);
  });

  const manifest = {
    source: ORIGIN,
    extractedAt: new Date().toISOString(),
    pageCount: pages.length,
    mediaCount: downloaded.length,
    pages,
    media: downloaded,
  };

  await writeFile(join(ARCHIVE_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(join(DATA_DIR, "site-content.json"), `${JSON.stringify({ source: manifest.source, extractedAt: manifest.extractedAt, pages }, null, 2)}\n`);
  await writeFile(join(ARCHIVE_DIR, "README.md"), `# Originals Interiors Content Archive\n\nExtracted from ${ORIGIN} on ${manifest.extractedAt}.\n\n- Indexed pages: ${pages.length}\n- Unique media references: ${downloaded.length}\n- Downloaded media: ${downloaded.filter((item) => item.status === "downloaded").length}\n- Remote fallbacks: ${downloaded.filter((item) => item.status !== "downloaded").length}\n\nRaw HTML for every indexed page is stored in \`pages/\`. The normalized page and media inventory is stored in \`manifest.json\`.\n`);
  console.log(`Done: ${pages.length} pages, ${downloaded.length} media files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
