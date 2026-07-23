import siteContent from "./data/site-content.json";

export const pages = siteContent.pages;

export function normalizePath(pathname = "/") {
  const clean = pathname.split("?")[0].split("#")[0];
  if (clean === "/") return "/";
  return `/${clean.replace(/^\/+|\/+$/g, "")}/`;
}

export function pageByPath(pathname) {
  const path = normalizePath(pathname);
  return pages.find((page) => normalizePath(page.path) === path);
}

export function photoImages(page) {
  if (!page?.images) return [];
  return page.images.filter((image) => {
    const haystack = `${image.local ?? ""} ${image.remote ?? ""} ${image.alt ?? ""}`.toLowerCase();
    return !haystack.includes("logo")
      && !haystack.includes("favicon")
      && !haystack.includes("modern-furniture")
      && !haystack.includes("map-bg")
      && !haystack.includes("page-title-bar")
      && !haystack.endsWith(".svg")
      && !haystack.includes("our-portfolio")
      && !haystack.includes("our-services");
  });
}

const SERVICE_PREVIEW_ASSETS = {
  "/services/lighting-accessories/": "PR2-49-b4fc0e44e.jpg",
  "/services/bespoke-joinery/": "Shira-52-478afc16b.jpg",
  "/services/hospitality-branding/": "084A5384x1-5c075ba35.jpg",
  "/services/wallpaper-artwork/": "Basement-22-4891dc096.jpg",
  "/services/3d-renders/": "03-View01-d98e0ee6e.jpg",
  "/services/furniture-supply/": "Villa-Sh-2-1-db72ebfe7.jpg",
  "/services/home-staging/": "Kings-7-copia-5be1dbf4c.webp",
  "/services/soft-furnishing-curtain-making/": "Kings-33-copia-5a6fe7701.webp",
};

export function servicePreviewImage(service) {
  const preferredAsset = SERVICE_PREVIEW_ASSETS[normalizePath(service.path)];
  const images = photoImages(service);
  const fromService = images.find((image) => image.local?.endsWith(preferredAsset));
  if (fromService) return fromService;

  // Allow curated previews sourced from other pages (e.g. project photography)
  if (preferredAsset) {
    for (const page of pages) {
      const match = photoImages(page).find((image) => image.local?.endsWith(preferredAsset));
      if (match) return match;
    }
  }

  return images[0] ?? null;
}

export function meaningfulBlocks(page) {
  return (page?.blocks ?? []).filter((block) => {
    const text = block.text.trim();
    return text.length > 1
      && !/^OriginalsInteriors\d{4}/.test(text)
      && !["Find out More", "View all Articles", "Follow Us"].includes(text);
  });
}

export const projects = pages.filter((page) => page.kind === "project" && page.path !== "/project/").reverse();
export const services = pages.filter((page) => page.kind === "service" && page.path !== "/services/");
export const articles = pages.filter((page) => page.kind === "article").sort((a, b) => b.path.localeCompare(a.path));

export function projectCategory(project) {
  const source = `${project.title} ${project.path}`.toLowerCase();
  if (source.includes("3d")) return "3D Renders";
  if (/(hotel|restaurant|realty|crisal|office|showhouse|show-apartment|branding|berkshire|reek-dalli)/.test(source)) return "Commercial";
  return "Residential";
}

export function dateFromPath(path) {
  const match = path.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!match) return "Studio Journal";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

export function firstParagraph(page, fallback = "") {
  return meaningfulBlocks(page).find((block) => block.type === "p")?.text ?? fallback;
}
