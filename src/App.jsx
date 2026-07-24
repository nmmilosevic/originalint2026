import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  articles,
  dateFromPath,
  firstParagraph,
  meaningfulBlocks,
  normalizePath,
  pageByPath,
  pages,
  photoImages,
  projectCategory,
  projects,
  servicePreviewImage,
  services,
} from "./content";

const EASE_EXPO = [0.16, 1, 0.3, 1];
const EASE_QUART = [0.25, 1, 0.5, 1];
const EASE_SMOOTH = [0.76, 0, 0.24, 1];
const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.46, ease: EASE_EXPO } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: EASE_QUART } },
};
const REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.54, delay, ease: EASE_EXPO },
  }),
};
const TITLE_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, delay, ease: EASE_EXPO },
  }),
};
const MENU_VARIANTS = {
  hidden: { y: "-100%" },
  visible: { y: "0%", transition: { duration: 0.64, ease: EASE_SMOOTH } },
  exit: { y: "-100%", transition: { duration: 0.58, ease: EASE_SMOOTH } },
};
const MENU_LINK_VARIANTS = {
  hidden: { opacity: 0, y: "108%" },
  visible: (index) => ({
    opacity: 1,
    y: "0%",
    transition: { delay: 0.14 + index * 0.055, duration: 0.58, ease: EASE_EXPO },
  }),
  exit: (index) => ({
    opacity: 0,
    y: "-108%",
    transition: { delay: (4 - index) * 0.032, duration: 0.34, ease: EASE_SMOOTH },
  }),
};
const HOME = pageByPath("/");
const ABOUT = pageByPath("/about/");
const CREATIVITY = pageByPath("/our-creativity/");
const CONTACT = pageByPath("/contact/");
const SERVICE_PREVIEWS = services.map(servicePreviewImage);
const INQUIRY_IMAGE = {
  local: "/media/originals/Kings-25-scaled-a70e600ee.jpg",
  alt: "Warm bedroom interior with textured walls, tailored lighting, and patterned textiles",
};
const SUPPLIERS = [
  ["Aldeco", "/media/originals/1--Aldeco-f6d4bda47.jpg"],
  ["Alhambra", "/media/originals/2--Alhambra-2d6fb2da5.png"],
  ["Andreu World", "/media/originals/3--Andreu-world-95b8018fd.jpg"],
  ["Aromas", "/media/originals/4--Aromas-fe3949590.png"],
  ["Arte", "/media/originals/5--Arte-d3ec4e6c7.jpg"],
  ["Bover", "/media/originals/6--Bover-69d6c2fb1.jpg"],
  ["Cane-line", "/media/originals/7--Cane-Line-719961752.png"],
  ["Casamance", "/media/originals/8--Casamance-add2ae75b.jpg"],
  ["Christian Lacroix", "/media/originals/9--Christian-Lacroix-e26b795a2.png"],
  ["Coach House", "/media/originals/10--Coach-House-0907ea96f.jpg"],
  ["Crisal", "/media/originals/11--Crisal-6379e4221.png"],
  ["Designers Guild", "/media/originals/12--Designers-Guild-55d47e2d6.png"],
  ["Ebb & Flow", "/media/originals/13--Ebb-Flow-22ff785c6.png"],
  ["Eichholtz", "/media/originals/14--Eichholtz-5e36f5d2c.png"],
  ["Élitis", "/media/originals/15--Elitis-47d1fac6c.png"],
  ["Ethimo", "/media/originals/16--Ethimo-64f991570.png"],
  ["Frette", "/media/originals/17--Frette-22a15fefc.png"],
  ["Gastón y Daniela", "/media/originals/18--Gaston-y-Daniela-8d00682d3.jpg"],
  ["Gescova", "/media/originals/19--Gescova-7e339a8fa.png"],
  ["Gommaire", "/media/originals/20--Gommaire-c3779c46f.png"],
  ["Güell Lamadrid", "/media/originals/21--Guell-2e6cc3b5e.png"],
  ["Houlès", "/media/originals/22--Houles-3e6d9ec4b.png"],
  ["Kettal", "/media/originals/23--Kettal-653e94bf1.jpg"],
  ["Light & Living", "/media/originals/24--Light-Living-003b1cab9.jpg"],
  ["Omexco", "/media/originals/25--Omexco-a29d44842.jpg"],
  ["Ontario", "/media/originals/26--Ontario-99125ce63.jpg"],
  ["Romo", "/media/originals/28--Romo-404fc91cd.jpg"],
  ["Zinc Textile", "/media/originals/29--Zinc-a0ba751e7.png"],
];
const TESTIMONIAL_AUTHORS = [
  "N & J · Belgium",
  "Karen · Swish Marbella",
  "Louise · Callum Swan Realty",
  "Annie & John · Marbella",
];
const TESTIMONIAL_ATTRIBUTION_PATTERNS = [
  /\s*N\s*&\s*J\s*-\s*Belgium\s*$/i,
  /\s*Karen\s*-\s*Swish Marbella\s*$/i,
  /\s*Louise\s*[–-]\s*Callum Swan Realty\s*$/i,
  /\s*Annie and John\s*\(Marbella\)\s*$/i,
];
// Simplified Natural Earth 1:10m country boundaries, CC0.
const WORLDWIDE_LOCATIONS = [
  {
    name: "Spain",
    places: "Marbella, Madrid, Segovia, Córdoba, Badajoz",
    scaleX: 0.766,
    path: "M16.4 8.7 L21.0 10.5 L29.5 9.2 L39.3 11.1 L58.4 11.1 L67.3 15.5 L76.2 15.0 L80.9 16.0 L81.7 17.9 L94.8 19.0 L92.0 23.1 L78.9 27.7 L71.6 35.3 L69.0 39.0 L72.9 44.3 L67.0 48.3 L66.2 52.3 L60.9 53.2 L55.9 58.6 L39.8 58.7 L31.5 63.7 L27.3 61.6 L25.4 58.5 L26.8 57.3 L22.3 54.7 L18.5 55.4 L17.6 52.7 L21.7 48.4 L18.9 46.3 L21.5 42.2 L17.4 37.6 L21.3 37.3 L21.9 27.8 L27.0 24.1 L22.8 21.2 L12.9 22.3 L12.6 19.9 L8.0 21.8 L9.0 16.1 L6.9 17.0 L7.9 15.2 L5.0 14.4 L16.4 8.5Z",
  },
  {
    name: "England & Ireland",
    places: "Yorkshire, London, Dublin",
    scaleX: 0.453,
    path: "M57.2 5.2 L59.2 5.7 L58.7 7.2 L49.9 10.5 L54.1 10.8 L49.6 12.6 L66.8 11.9 L68.4 13.6 L63.3 19.6 L57.5 21.5 L62.6 22.0 L53.7 23.2 L62.7 23.9 L69.3 27.1 L72.4 33.8 L77.2 35.2 L82.0 41.0 L75.8 40.4 L82.6 42.5 L83.5 44.3 L81.1 46.0 L92.9 47.1 L92.3 51.8 L83.9 56.3 L91.0 58.0 L82.5 61.4 L70.8 60.3 L63.5 63.0 L56.3 61.9 L54.4 65.2 L51.1 63.5 L44.1 66.8 L40.3 66.1 L51.0 58.3 L59.5 58.2 L64.0 54.3 L57.6 56.9 L50.6 55.7 L52.0 54.8 L49.9 54.0 L44.1 54.7 L43.3 53.3 L52.9 48.6 L52.0 45.9 L47.1 46.7 L50.8 44.2 L61.7 42.9 L59.8 42.6 L59.5 40.1 L61.0 36.6 L58.3 37.6 L55.2 34.5 L59.5 31.3 L49.6 31.8 L49.6 33.4 L46.7 32.1 L45.9 33.6 L44.3 31.0 L47.4 28.1 L47.1 22.7 L45.4 25.0 L43.0 24.1 L45.8 22.1 L42.3 23.8 L41.7 28.5 L39.8 28.3 L42.0 25.3 L40.4 24.4 L41.5 21.5 L45.4 18.9 L40.5 20.4 L38.3 19.6 L41.4 19.1 L36.6 18.9 L42.3 16.1 L40.2 14.8 L42.2 14.1 L39.2 13.4 L41.2 12.9 L39.7 10.9 L44.8 11.0 L42.5 9.4 L42.7 7.9 L45.9 8.2 L44.3 7.3 L45.4 5.4 L57.1 5.0ZM30.3 29.1 L22.9 35.0 L29.0 37.4 L30.8 35.3 L37.5 38.3 L35.7 38.4 L38.2 45.7 L34.8 49.9 L35.7 51.2 L31.3 50.5 L15.4 56.1 L11.2 56.4 L13.0 54.2 L8.7 55.4 L12.3 53.4 L8.2 54.0 L7.0 53.4 L11.4 51.5 L6.6 51.2 L18.7 47.7 L10.4 48.4 L17.6 43.8 L8.7 42.3 L12.9 39.7 L9.2 36.6 L20.3 36.7 L19.5 35.6 L23.2 33.6 L18.4 33.3 L21.6 32.3 L22.2 30.0 L26.6 29.2 L26.5 31.4 L29.8 28.7Z",
  },
  {
    name: "France",
    places: "Normandy, Courchevel, Cap Ferrat",
    scaleX: 0.683,
    path: "M55.7 5.8 L57.4 8.1 L67.3 11.4 L67.3 13.5 L71.6 12.2 L71.8 14.3 L76.3 16.6 L95.0 20.4 L90.7 26.2 L90.7 29.9 L86.7 30.5 L79.5 39.4 L85.1 38.0 L86.8 41.4 L85.4 43.0 L87.8 45.0 L83.9 47.1 L86.7 49.0 L85.8 52.1 L91.5 54.2 L81.0 61.4 L73.1 57.8 L72.0 59.3 L66.6 57.9 L59.6 61.2 L59.9 65.7 L55.7 66.4 L27.9 61.3 L25.7 59.1 L30.8 49.9 L29.5 50.3 L30.3 44.3 L34.6 47.7 L29.9 42.9 L31.3 42.9 L30.5 39.0 L23.7 35.3 L22.9 32.8 L24.8 31.9 L21.4 32.1 L21.7 30.4 L18.0 30.1 L19.5 29.6 L16.5 30.7 L16.4 28.8 L7.9 28.3 L5.4 26.8 L8.8 24.8 L5.2 24.7 L5.4 23.1 L16.4 21.1 L19.6 23.5 L28.5 22.4 L25.0 15.1 L29.6 15.7 L30.3 17.7 L41.0 17.0 L38.7 16.5 L49.8 11.8 L49.3 7.1 L55.5 5.7Z",
  },
  { name: "Monaco", places: "", scaleX: 0.715, path: "M95.0 32.7 L70.5 48.3 L53.4 64.6 L23.8 62.9 L5.0 58.6 L6.9 44.3 L13.7 29.6 L32.3 14.5 L56.7 7.4 L80.9 17.5Z" },
  { name: "Gibraltar", places: "", scaleX: 0.551, path: "M30.1 5.0 L69.9 5.0 L67.5 27.9 L69.3 40.0 L63.3 67.0 L46.6 49.2Z" },
  {
    name: "Morocco",
    places: "Rabat, Casablanca, Marrakesh",
    scaleX: 1.143,
    path: "M65.5 5.0 L68.0 7.8 L75.9 7.1 L81.0 10.1 L83.5 21.2 L76.2 21.5 L72.3 24.6 L73.0 27.3 L64.9 32.4 L58.0 32.4 L53.3 34.6 L51.5 36.0 L51.0 42.6 L39.9 43.7 L35.4 52.4 L29.2 57.3 L25.9 66.2 L15.8 67.0 L20.4 56.9 L24.8 53.0 L26.7 46.6 L30.4 44.5 L33.1 39.2 L39.6 37.4 L44.7 33.4 L47.3 29.8 L46.5 24.4 L49.0 19.3 L59.0 13.5 L63.2 5.6 L65.4 5.0Z",
  },
  {
    name: "USA",
    places: "Miami, Fisher Island",
    scaleX: 0.785,
    path: "M51.1 17.1 L68.2 21.7 L71.4 26.1 L69.8 28.2 L71.8 28.7 L82.4 24.0 L89.0 23.3 L91.8 20.2 L95.0 24.1 L89.9 26.0 L88.8 28.0 L90.1 29.1 L84.1 29.7 L80.9 36.0 L81.2 32.4 L80.3 34.7 L79.1 33.8 L81.7 38.3 L79.9 37.6 L81.4 38.4 L79.5 38.8 L80.4 39.7 L72.7 44.5 L74.6 52.0 L73.5 54.8 L69.0 47.4 L62.3 46.2 L58.5 47.1 L60.1 48.8 L51.4 47.8 L47.5 50.6 L47.8 53.6 L45.6 53.1 L41.3 47.6 L38.3 48.8 L33.4 44.5 L26.3 45.2 L11.7 40.4 L8.5 35.6 L10.0 34.7 L7.7 34.8 L5.6 31.3 L7.4 22.1 L5.1 18.8 L8.1 19.1 L7.8 20.7 L8.1 17.7 L48.3 17.7Z",
  },
  {
    name: "UAE",
    places: "Abu Dhabi & Dubai",
    scaleX: 0.918,
    path: "M89.5 6.9 L88.9 12.3 L93.0 14.9 L93.2 24.7 L88.1 29.1 L85.9 24.8 L82.7 26.3 L81.9 38.1 L85.1 38.3 L86.3 40.8 L76.6 42.9 L78.0 46.4 L72.4 58.0 L70.5 67.0 L24.5 61.3 L7.0 40.4 L7.2 35.3 L13.2 42.9 L20.6 42.1 L25.3 38.5 L43.1 41.4 L52.6 39.6 L58.1 37.0 L60.7 34.2 L57.9 32.6 L60.9 33.1 L62.0 28.8 L73.4 19.6 L74.3 20.7 L78.3 13.9 L85.5 10.4 L87.7 5.2 L89.6 6.4Z",
  },
];
const MENU_DEFAULT_IMAGE = photoImages(HOME)[1] ?? photoImages(HOME)[0];
const findImageByFile = (filename) => {
  for (const page of [HOME, ABOUT, CREATIVITY, CONTACT, ...projects, ...articles, ...services]) {
    const match = photoImages(page).find((image) => image.local?.endsWith(filename));
    if (match) return match;
  }
  return null;
};
const MENU_PREVIEW_BY_PATH = {
  "/portfolio/": photoImages(projects[0])[0] ?? MENU_DEFAULT_IMAGE,
  "/services/": SERVICE_PREVIEWS[0] ?? MENU_DEFAULT_IMAGE,
  "/about/": findImageByFile("Originals-Team-2NEW-16b076e1b.jpg")
    ?? findImageByFile("ORIGINALS-TEAM-PHOTO-1-scaled-3eaf09f13.gif")
    ?? MENU_DEFAULT_IMAGE,
  "/blog/": photoImages(articles[0])[0] ?? MENU_DEFAULT_IMAGE,
  "/contact/": photoImages(CREATIVITY)[1] ?? photoImages(CONTACT)[1] ?? MENU_DEFAULT_IMAGE,
};
const IMAGE_BY_LOCAL_PATH = new Map(
  pages.flatMap((page) => page.images ?? []).map((image) => [image.local, image]),
);
const RESPONSIVE_IMAGE_WIDTHS = [480, 900, 1440, 1920];

function optimizedImageData(source) {
  const metadata = IMAGE_BY_LOCAL_PATH.get(source);
  if (!metadata?.width || !metadata?.height) return { src: source };

  const sourceWidth = metadata.width;
  const displayWidth = Math.min(sourceWidth, RESPONSIVE_IMAGE_WIDTHS.at(-1));
  const displayHeight = Math.round(metadata.height * (displayWidth / sourceWidth));
  const candidates = RESPONSIVE_IMAGE_WIDTHS.filter((width) => width < sourceWidth);
  candidates.push(displayWidth);
  const uniqueCandidates = [...new Set(candidates)];
  const filename = source.split("/").at(-1);
  const stem = filename.replace(/\.[^.]+$/, "");
  const candidatePath = (candidateWidth) => `/media/optimized/${stem}-${candidateWidth}.webp`;

  return {
    src: candidatePath(uniqueCandidates.at(-1)),
    srcSet: uniqueCandidates.map((candidateWidth) => `${candidatePath(candidateWidth)} ${candidateWidth}w`).join(", "),
    width: displayWidth,
    height: displayHeight,
  };
}

function OptimizedImage({
  image,
  alt,
  eager = false,
  sizes = "(max-width: 820px) 100vw, 70vw",
  ...props
}) {
  const source = typeof image === "string" ? image : image?.local ?? image?.remote;
  if (!source) return null;
  const optimized = optimizedImageData(source);

  return (
    <img
      {...props}
      {...optimized}
      alt={alt ?? (typeof image === "string" ? "" : image?.alt || "Originals Interiors project")}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "low"}
      decoding="async"
      sizes={optimized.srcSet ? sizes : undefined}
    />
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <m.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

function Wordmark() {
  return (
    <span className="wordmark" aria-label="Originals Interiors">
      <span>Originals</span>
      <small>Interiors</small>
    </span>
  );
}

function ArrowIcon({ reverse = false }) {
  return (
    <svg viewBox="0 0 28 18" aria-hidden="true" className={reverse ? "reverse" : ""}>
      <path d="M1 9h24M18 2l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);
  const [menuPresent, setMenuPresent] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [activeMenuPath, setActiveMenuPath] = useState("/portfolio/");
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const menuLinks = [
    ["Projects", "/portfolio/"],
    ["Services", "/services/"],
    ["Studio", "/about/"],
    ["Journal", "/blog/"],
    ["Contact", "/contact/"],
  ];
  const activeMenuImage = MENU_PREVIEW_BY_PATH[activeMenuPath] ?? MENU_DEFAULT_IMAGE;

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    setOverDark(["/", "/our-creativity/"].includes(normalizePath(location.pathname)));
  }, [location.pathname]);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const darkRoute = ["/", "/our-creativity/"].includes(normalizePath(location.pathname));
    const threshold = normalizePath(location.pathname) === "/" ? window.innerHeight * 0.82 : window.innerHeight * 0.62;
    const next = darkRoute && latest < threshold;
    setOverDark((current) => current === next ? current : next);
  });
  useEffect(() => {
    document.body.classList.toggle("menu-open", open || menuPresent);
    return () => document.body.classList.remove("menu-open");
  }, [open, menuPresent]);
  useEffect(() => {
    if (!open) return;
    setActiveMenuPath("/portfolio/");
  }, [open]);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    setMenuPresent(true);
    setOpen(true);
  }, [open]);

  const handleLogoClick = useCallback((event) => {
    setOpen(false);
    if (normalizePath(location.pathname) !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [location.pathname, reduceMotion]);

  return (
    <>
      <header className={`site-header ${overDark && !menuPresent ? "over-dark" : ""} ${open ? "is-open" : ""}`}>
        <Link to="/" className="header-logo" onClick={handleLogoClick}><Wordmark /></Link>
        <button className="menu-toggle" onClick={toggle} aria-expanded={open} aria-controls="site-menu">
          <span>{open ? "Close" : "Menu"}</span>
          <span className="menu-glyph" aria-hidden="true"><i /><i /></span>
        </button>
      </header>
      <AnimatePresence initial={false} onExitComplete={() => setMenuPresent(false)}>
        {open && (
          <m.aside
            id="site-menu"
            className="menu-panel"
            variants={MENU_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: "transform" }}
          >
            <div className="menu-image" aria-hidden="true">
              <AnimatePresence initial={false}>
                <m.div
                  className="menu-image-frame"
                  key={activeMenuImage?.local}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.32, ease: EASE_EXPO }}
                >
                  <OptimizedImage image={activeMenuImage} alt="" sizes="(max-width: 980px) 1px, 42vw" />
                </m.div>
              </AnimatePresence>
            </div>
            <nav className="menu-links" aria-label="Primary navigation">
              {menuLinks.map(([label, path], index) => (
                <div className="menu-link-row" key={path}>
                  <m.div
                    className="menu-link-reveal"
                    custom={index}
                    variants={MENU_LINK_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      to={path}
                      onMouseEnter={() => setActiveMenuPath(path)}
                      onFocus={() => setActiveMenuPath(path)}
                    >
                      <span>{label}</span>
                      <ArrowIcon />
                    </Link>
                  </m.div>
                </div>
              ))}
            </nav>
          </m.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div
      className={`reveal-mask ${className}`}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.12 }}
    >
      <m.div
        className="reveal-content"
        custom={delay}
        variants={REVEAL_VARIANTS}
      >
        {children}
      </m.div>
    </m.div>
  );
}

function RevealTitle({ children, className = "", delay = 0.08 }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`title-reveal ${className}`}>
      <m.h1
        custom={delay}
        variants={TITLE_VARIANTS}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        {children}
      </m.h1>
    </div>
  );
}

function RevealImage({ image, className = "", ratio = "landscape", eager = false, sizes = "(max-width: 820px) 100vw, 70vw" }) {
  const reduceMotion = useReducedMotion();
  if (!image) return <div className={`image-shell ${ratio} ${className}`} aria-hidden="true" />;
  return (
    <m.figure
      className={`image-shell ${ratio} ${className}`}
      initial={reduceMotion ? false : { opacity: 0.35, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.54, ease: EASE_EXPO }}
    >
      <OptimizedImage
        image={image}
        eager={eager}
        sizes={sizes}
      />
    </m.figure>
  );
}

function TextLink({ to, children, light = false }) {
  return (
    <Link to={to} className={`text-link ${light ? "light" : ""}`}>
      <span>{children}</span><ArrowIcon />
    </Link>
  );
}

function SectionLabel({ children, light = false }) {
  return <Reveal className={`section-label ${light ? "light" : ""}`}>{children}</Reveal>;
}

function PageIntro({ eyebrow, title, description, dark = false }) {
  return (
    <section className={`page-intro ${dark ? "dark" : ""}`}>
      <div className="page-grid">
        <SectionLabel light={dark}>{eyebrow}</SectionLabel>
        <RevealTitle className="page-title" delay={0.1}>{title}</RevealTitle>
        {description && <Reveal className="intro-copy-reveal" delay={0.2}><p className="intro-copy">{description}</p></Reveal>}
      </div>
    </section>
  );
}

function HomePage() {
  const images = photoImages(HOME);
  const featured = projects.slice(0, 3);
  const latestArticles = articles.slice(0, 2);
  const intro = firstParagraph(HOME);
  const testimonials = meaningfulBlocks(HOME).filter((block) => block.type === "list-item" && block.text.startsWith("“")).slice(0, 4);
  const [testimonial, setTestimonial] = useState(0);
  const hero = images.find((image) => image.remote?.includes("Villa-C-Exterior")) ?? images[0];

  return (
    <>
      <section className="home-hero">
        <div className="hero-media"><OptimizedImage image={hero} eager sizes="100vw" /></div>
        <div className="hero-wash" />
        <div className="hero-kicker">Interior architecture · Marbella / Worldwide</div>
        <RevealTitle className="home-title" delay={0.06}>
          <span>Spaces,</span><span>shaped around</span><span>you.</span>
        </RevealTitle>
        <a href="#studio" className="hero-scroll">Discover the studio <span>↓</span></a>
      </section>

      <section id="studio" className="section-shell home-intro">
        <SectionLabel>The Studio</SectionLabel>
        <Reveal className="intro-statement"><h2>An international team. A singular point of view.</h2></Reveal>
        <Reveal className="intro-body">
          <p>{intro}</p>
          <TextLink to="/about/">Meet Originals</TextLink>
        </Reveal>
        <RevealImage image={images[2]} className="intro-image" ratio="portrait" />
      </section>

      <section className="featured-projects">
        <div className="section-shell featured-heading">
          <SectionLabel>Selected Work</SectionLabel>
          <Reveal><h2>Interiors with a life of their own.</h2></Reveal>
        </div>
        <div className="featured-list">
          {featured.map((project, index) => {
            const image = photoImages(project)[0];
            return (
              <article className={`featured-project feature-${index + 1}`} key={project.path}>
                <Link to={project.path} aria-label={`View ${project.title}`}>
                  <RevealImage image={image} ratio={index === 1 ? "portrait" : "landscape"} />
                  <div className="project-caption">
                    <div><span>{projectCategory(project)}</span></div>
                    <h3>{project.title}</h3>
                    <ArrowIcon />
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
        <div className="section-shell all-work"><TextLink to="/portfolio/">View all projects</TextLink></div>
      </section>

      <ServicesRail />

      <Suppliers />

      <section className="creativity-callout">
        <RevealImage image={photoImages(CREATIVITY)[1]} ratio="cinema" sizes="100vw" />
        <div className="creativity-copy">
          <SectionLabel light>Made by hand</SectionLabel>
          <Reveal><h2>Creativity lives in the detail.</h2></Reveal>
          <p>From the first sketch to the final stitch, our studio shapes every layer of an interior.</p>
          <TextLink to="/our-creativity/" light>Explore our creativity</TextLink>
        </div>
      </section>

      <section className="section-shell worldwide">
        <SectionLabel>Worldwide</SectionLabel>
        <Reveal className="world-title"><h2>Marbella is home. Our work travels.</h2></Reveal>
        <div className="location-list">
          {WORLDWIDE_LOCATIONS.map((location, index) => (
            <Reveal className="location-item" key={location.name} delay={index * 0.025}>
              <div className="location-copy">
                <strong>{location.name}</strong>
                {location.places && <span>{location.places}</span>}
              </div>
              <svg className="country-shape" viewBox="0 0 100 72" aria-hidden="true" focusable="false" style={{ "--country-scale-x": location.scaleX }}>
                <path d={location.path} />
              </svg>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <div className="section-shell testimonial-grid">
          <SectionLabel light>Client Notes</SectionLabel>
          <div className="quote-mark" aria-hidden="true">“</div>
          <AnimatePresence mode="wait">
            <m.div
              className="testimonial-copy"
              key={testimonial}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE_EXPO }}
            >
              <blockquote>{testimonials[testimonial]?.text.replace(TESTIMONIAL_ATTRIBUTION_PATTERNS[testimonial], "").trim()}</blockquote>
              <cite>{TESTIMONIAL_AUTHORS[testimonial]}</cite>
            </m.div>
          </AnimatePresence>
          <div className="quote-controls">
            <button onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial"><ArrowIcon reverse /></button>
            <span>{String(testimonial + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}</span>
            <button onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} aria-label="Next testimonial"><ArrowIcon /></button>
          </div>
        </div>
      </section>

      <section className="section-shell journal-preview">
          <SectionLabel>Journal</SectionLabel>
        <Reveal className="journal-title"><h2>Ideas for considered living.</h2></Reveal>
        <div className="journal-items">
          {latestArticles.map((article) => (
            <Link to={article.path} key={article.path} className="journal-item">
              <RevealImage image={photoImages(article)[0]} ratio="landscape" />
              <div><span>{dateFromPath(article.path)}</span><h3>{article.title}</h3><ArrowIcon /></div>
            </Link>
          ))}
        </div>
      </section>
      <InquiryBanner />
    </>
  );
}

function ServicesRail({ variant = "home" }) {
  const [active, setActive] = useState(0);
  const descriptions = services.map((service) => firstParagraph(service, "A tailored service delivered by our international studio."));
  const activeImage = SERVICE_PREVIEWS[active];
  const isPage = variant === "page";

  return (
    <section className={`section-shell services-rail ${isPage ? "is-page" : ""}`}>
      <SectionLabel>{isPage ? "Explore our services" : "What we do"}</SectionLabel>
      <div className="services-intro">
        <Reveal><h2>{isPage ? "Every discipline, held together." : "One studio. Every detail."}</h2></Reveal>
        <p>{isPage ? "Choose a single expertise or bring the whole studio together. Every service is coordinated around one clear interior vision." : "From the first meeting to final installation, our specialists make complex projects feel effortless."}</p>
      </div>
      <div className="services-layout">
        <div className="service-rows">
          {services.map((service, index) => (
            <Link
              to={service.path}
              className="service-row"
              key={service.path}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              {isPage && <RevealImage image={SERVICE_PREVIEWS[index]} ratio="landscape" className="service-row-mobile-image" />}
              <div className="service-row-copy"><h3>{service.title}</h3><p>{descriptions[index]}</p></div>
              <ArrowIcon />
            </Link>
          ))}
        </div>
        <div className="service-preview" aria-hidden="true">
          <AnimatePresence initial={false}>
            <m.div
              className="service-preview-frame"
              key={activeImage?.local}
              initial={{ opacity: 0, scale: 1.014 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.992 }}
              transition={{ duration: 0.32, ease: EASE_EXPO }}
            >
              <OptimizedImage image={activeImage} alt="" sizes="(max-width: 980px) 1px, 36vw" />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Suppliers() {
  return (
    <section className="suppliers">
      <div className="section-shell supplier-shell">
        <SectionLabel>Our Suppliers</SectionLabel>
        <Reveal className="supplier-intro">
          <h2>A considered network of makers.</h2>
          <p>Textiles, lighting, furniture, and finishes sourced through trusted design houses from across Europe.</p>
        </Reveal>
        <div className="supplier-grid" aria-label="Originals Interiors suppliers">
          {SUPPLIERS.map(([name, src]) => (
            <div className="supplier-mark" key={name}>
              <OptimizedImage image={src} alt={`${name} supplier logo`} sizes="(max-width: 560px) 28vw, (max-width: 980px) 20vw, 12vw" />
            </div>
          ))}
        </div>
        <div className="preferred-partner">
          <Reveal className="preferred-mark">
            <span>Preferred partner · Marbella</span>
            <OptimizedImage image="/media/originals/14--Eichholtz-5e36f5d2c.png" alt="Eichholtz" sizes="13rem" />
          </Reveal>
          <Reveal className="preferred-copy" delay={0.08}>
            <h3>Exclusive access to Eichholtz.</h3>
            <p>As the brand’s preferred partner in Marbella, Originals gives private clients and design professionals access to its latest European furniture, lighting, and accessory collections.</p>
            <a className="text-link" href="https://www.eichholtz.com/" target="_blank" rel="noreferrer"><span>Discover Eichholtz</span><ArrowIcon /></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PortfolioPage({ page }) {
  const initialFilter = page?.path.includes("3d-renders") ? "3D Renders" : page?.path.includes("commercial") ? "Commercial" : page?.path.includes("residential") ? "Residential" : "All";
  const [filter, setFilter] = useState(initialFilter);
  const visible = useMemo(() => filter === "All" ? projects : projects.filter((project) => projectCategory(project) === filter), [filter]);
  return (
    <>
      <PageIntro eyebrow="Portfolio" title="Places with presence." description="Residential, commercial, and hospitality interiors shaped around the people who inhabit them." />
      <section className="section-shell portfolio-index">
        <div className="project-filters" role="group" aria-label="Filter projects">
          {["All", "Residential", "Commercial", "3D Renders"].map((name) => <button className={filter === name ? "active" : ""} onClick={() => setFilter(name)} key={name}>{name}</button>)}
        </div>
        <m.div className="project-masonry" layout>
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <m.article
                className={`project-tile ${index % 5 === 0 ? "wide" : index % 3 === 0 ? "tall" : ""}`}
                key={project.path}
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.55, ease: EASE_EXPO }}
              >
                <Link to={project.path}>
                  <RevealImage image={photoImages(project)[0]} ratio={index % 3 === 0 ? "portrait" : "landscape"} />
                  <div className="tile-copy"><span>{projectCategory(project)}</span><h2>{project.title}</h2><ArrowIcon /></div>
                </Link>
              </m.article>
            ))}
          </AnimatePresence>
        </m.div>
      </section>
      <InquiryBanner />
    </>
  );
}

function ProjectPage({ page }) {
  const images = photoImages(page);
  const copy = meaningfulBlocks(page).filter((block) => ["p", "blockquote"].includes(block.type)).slice(0, 5);
  const currentIndex = projects.findIndex((project) => project.path === page.path);
  const next = projects[(currentIndex + 1) % projects.length];
  return (
    <>
      <section className="project-hero section-shell">
        <div className="project-meta"><span>{projectCategory(page)}</span><span>Originals Interiors</span></div>
        <RevealTitle className="project-title">{page.title}</RevealTitle>
        {copy[0] && <p>{copy[0].text}</p>}
      </section>
      <RevealImage image={images[0]} className="project-hero-image" ratio="cinema" eager sizes="100vw" />
      {copy.length > 1 && (
        <section className="section-shell project-narrative">
          <SectionLabel>The Project</SectionLabel>
          <h2>{copy[1]?.text}</h2>
          <div>{copy.slice(2).map((block) => <p key={block.text}>{block.text}</p>)}</div>
        </section>
      )}
      <section className="project-gallery">
        {images.slice(1).map((image, index) => (
          <RevealImage image={image} key={`${image.local}-${index}`} ratio={index % 5 === 1 || index % 5 === 2 ? "portrait" : "landscape"} className={`gallery-image gallery-${index % 5}`} />
        ))}
      </section>
      {next && (
        <Link to={next.path} className="next-project">
          <RevealImage image={photoImages(next)[0]} ratio="cinema" />
          <div><span>Next project</span><h2>{next.title}</h2><ArrowIcon /></div>
        </Link>
      )}
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <section className="section-shell services-page-hero">
        <SectionLabel>Services</SectionLabel>
        <RevealTitle className="services-page-title">From first idea to final placement.</RevealTitle>
        <Reveal className="services-page-intro" delay={0.18}>
          <p>Originals brings designers, architects, makers, suppliers, and installers into one considered process. From a single room to a complete residence or hospitality project, every decision is connected.</p>
        </Reveal>
        <RevealImage image={SERVICE_PREVIEWS[5]} ratio="landscape" className="services-page-primary" sizes="(max-width: 820px) 100vw, 70vw" />
        <RevealImage image={SERVICE_PREVIEWS[0]} ratio="portrait" className="services-page-detail" sizes="(max-width: 820px) 100vw, 32vw" />
      </section>
      <ServicesRail variant="page" />
      <InquiryBanner />
    </>
  );
}

function ServicePage({ page }) {
  const images = photoImages(page);
  const blocks = meaningfulBlocks(page);
  const paragraphs = blocks.filter((block) => block.type === "p");
  return (
    <>
      <section className="service-detail-hero section-shell">
        <SectionLabel>Originals Interiors</SectionLabel>
        <RevealTitle className="service-title">{page.title}</RevealTitle>
        <p>{paragraphs[0]?.text ?? page.description}</p>
        <TextLink to="/contact/">Discuss your project</TextLink>
      </section>
      <RevealImage image={images[0]} ratio="cinema" className="wide-intro-image" eager sizes="100vw" />
      <section className="section-shell service-story">
        <SectionLabel>Our Approach</SectionLabel>
        <div className="service-story-copy">
          {paragraphs.slice(1).map((block) => <p key={block.text}>{block.text}</p>)}
        </div>
      </section>
      <section className="service-gallery">
        {images.slice(1).map((image, index) => <RevealImage image={image} key={`${image.local}-${index}`} ratio={index % 4 === 0 ? "portrait" : "landscape"} className={`service-gallery-${index % 4}`} />)}
      </section>
      <MoreServices current={page.path} />
      <InquiryBanner />
    </>
  );
}

function MoreServices({ current }) {
  return (
    <section className="section-shell more-services">
      <SectionLabel>Explore</SectionLabel>
      <div>{services.filter((service) => service.path !== current).slice(0, 3).map((service) => <TextLink to={service.path} key={service.path}>{service.title}</TextLink>)}</div>
    </section>
  );
}

function AboutPage() {
  const images = photoImages(ABOUT);
  const blocks = meaningfulBlocks(ABOUT);
  const paragraphs = blocks.filter((block) => block.type === "p");
  return (
    <>
      <PageIntro eyebrow="Our Studio" title="International by nature. Personal by design." description={paragraphs[0]?.text} />
      <RevealImage image={images.find((image) => image.local?.toLowerCase().includes("team")) ?? images[0]} ratio="cinema" className="wide-intro-image" eager sizes="100vw" />
      <section className="section-shell about-story">
        <SectionLabel>Originals</SectionLabel>
        <Reveal><h2>Experience, curiosity, and the confidence to listen.</h2></Reveal>
        <div>{paragraphs.slice(1).map((paragraph) => <p key={paragraph.text}>{paragraph.text}</p>)}</div>
      </section>
      <section className="section-shell about-legacy">
        <RevealImage image={images[0]} ratio="portrait" className="about-legacy-image" />
        <div className="about-legacy-copy">
          <SectionLabel>Since 1992</SectionLabel>
          <Reveal><h2>Rooted in Marbella. Designed without borders.</h2></Reveal>
          <Reveal className="about-legacy-body" delay={0.08}>
            <p>From our studio close to Puerto Banús, Originals brings interior designers, architects, furniture specialists, makers, and installers together around one shared vision.</p>
          </Reveal>
          <div className="about-legacy-facts">
            <Reveal><span>Studio</span><strong>Puerto Banús, Marbella</strong></Reveal>
            <Reveal delay={0.04}><span>Projects</span><strong>Residential, commercial, hospitality</strong></Reveal>
            <Reveal delay={0.08}><span>Delivery</span><strong>Design, sourcing, installation</strong></Reveal>
          </div>
          <TextLink to="/contact/">Visit the studio</TextLink>
        </div>
      </section>
      <InquiryBanner />
    </>
  );
}

function CreativityPage() {
  const images = photoImages(CREATIVITY);
  const paragraphs = meaningfulBlocks(CREATIVITY).filter((block) => block.type === "p");
  return (
    <>
      <PageIntro eyebrow="Our Creativity" title="Where imagination becomes material." description={paragraphs[0]?.text} dark />
      <section className="creativity-sequence">
        {images.map((image, index) => (
          <article key={`${image.local}-${index}`} className={`creative-step step-${index % 3}`}>
            <RevealImage image={image} ratio={index % 3 === 1 ? "portrait" : "landscape"} />
            <div>{paragraphs[index] && <p>{paragraphs[index].text}</p>}</div>
          </article>
        ))}
      </section>
      <InquiryBanner />
    </>
  );
}

function BlogPage() {
  const [visible, setVisible] = useState(12);
  return (
    <>
      <PageIntro eyebrow="Journal" title="Notes on living well." description="Materials, colour, craft, and the ideas shaping our interiors." />
      <section className="section-shell article-index">
        {articles.slice(0, visible).map((article, index) => (
          <Link to={article.path} className={`article-teaser ${index === 0 ? "lead" : ""}`} key={article.path}>
            <RevealImage image={photoImages(article)[0]} ratio={index === 0 ? "cinema" : "landscape"} />
            <div><span>{dateFromPath(article.path)}</span><h2>{article.title}</h2><p>{firstParagraph(article)}</p><ArrowIcon /></div>
          </Link>
        ))}
        {visible < articles.length && <button className="load-more" onClick={() => setVisible((count) => count + 12)}>Load more stories <span>{visible} / {articles.length}</span></button>}
      </section>
      <InquiryBanner />
    </>
  );
}

function ArticlePage({ page }) {
  const images = photoImages(page);
  const blocks = meaningfulBlocks(page).filter((block, index, list) => index === 0 || block.text !== list[index - 1].text);
  const groupedBlocks = blocks.reduce((groups, block) => {
    if (block.type !== "list-item") return [...groups, block];
    const previous = groups[groups.length - 1];
    if (previous?.type === "list") {
      previous.items.push(block.text);
      return groups;
    }
    return [...groups, { type: "list", items: [block.text] }];
  }, []);
  return (
    <article className="article-page">
      <header className="article-header section-shell">
        <div><span>Journal</span><span>{dateFromPath(page.path)}</span></div>
        <RevealTitle className="article-title">{page.title}</RevealTitle>
      </header>
      {images[0] && <RevealImage image={images[0]} ratio="cinema" className="article-hero" eager sizes="100vw" />}
      <div className="article-body section-shell">
        <aside><span>Originals Interiors</span><a href={`mailto:?subject=${encodeURIComponent(page.title)}`}>Share by email</a></aside>
        <div className="article-prose">
          {groupedBlocks.map((block, index) => {
            if (["h2", "h3", "h4"].includes(block.type)) return <h2 key={`${block.text}-${index}`}>{block.text}</h2>;
            if (block.type === "blockquote") return <blockquote key={`${block.text}-${index}`}>{block.text}</blockquote>;
            if (block.type === "list") return <ul key={`article-list-${index}`}>{block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul>;
            return <p key={`${block.text}-${index}`}>{block.text}</p>;
          })}
        </div>
      </div>
      {images.length > 1 && <section className="article-gallery">{images.slice(1).map((image, index) => <RevealImage image={image} key={`${image.local}-${index}`} ratio={index % 2 ? "portrait" : "landscape"} />)}</section>}
      <InquiryBanner />
    </article>
  );
}

function ContactPage() {
  const images = photoImages(CONTACT);
  const [sent, setSent] = useState(false);
  const submit = (event) => { event.preventDefault(); setSent(true); };
  return (
    <>
      <PageIntro eyebrow="Contact" title="Let’s create something original." description="Tell us where you are, what you are imagining, and how we can help." />
      <section className="section-shell contact-layout">
        <div className="contact-details">
          <RevealImage image={images[0]} ratio="portrait" />
          <div><span>Visit the studio</span><p>Urb. La Alcazaba S/N<br />CN 340, KM 175<br />29660 Marbella, Málaga<br />Spain</p></div>
          <div><span>Speak with us</span><a href="tel:+34952863230">+34 952 863 230</a><a href="mailto:originals@originalsinteriors.com">originals@originalsinteriors.com</a></div>
          <div><span>Opening hours</span><p>Monday to Friday, 10:00 to 18:00<br />Saturday by appointment</p></div>
        </div>
        {sent ? (
          <m.div className="form-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><span>Thank you</span><h2>Your project is on our radar.</h2><p>Our Marbella studio will be in touch shortly.</p></m.div>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <label><span>Name</span><input required name="name" autoComplete="name" /></label>
            <label><span>Email</span><input required type="email" name="email" autoComplete="email" /></label>
            <label><span>Phone</span><input type="tel" name="phone" autoComplete="tel" /></label>
            <label><span>Project location</span><input name="location" /></label>
            <label className="full"><span>What are you imagining?</span><textarea required name="message" rows="6" /></label>
            <button type="submit">Send your enquiry <ArrowIcon /></button>
          </form>
        )}
      </section>
    </>
  );
}

function TextPage({ page }) {
  const images = photoImages(page);
  const blocks = meaningfulBlocks(page);
  return (
    <>
      <PageIntro eyebrow="Originals Interiors" title={page.title} description={page.description} />
      {images[0] && <RevealImage image={images[0]} ratio="cinema" className="wide-intro-image" />}
      <section className="section-shell generic-content">
        {blocks.map((block, index) => {
          if (["h1", "h2", "h3", "h4"].includes(block.type)) return <h2 key={`${block.text}-${index}`}>{block.text}</h2>;
          if (block.type === "blockquote") return <blockquote key={`${block.text}-${index}`}>{block.text}</blockquote>;
          if (block.type === "list-item") return <li key={`${block.text}-${index}`}>{block.text}</li>;
          return <p key={`${block.text}-${index}`}>{block.text}</p>;
        })}
      </section>
      <InquiryBanner />
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found section-shell">
      <span>404</span><h1>This room is still being imagined.</h1><TextLink to="/">Return home</TextLink>
    </section>
  );
}

function InquiryBanner() {
  return (
    <section className="inquiry-banner">
      <div className="inquiry-copy">
        <span>Have a project in mind?</span>
        <Reveal><h2>Let’s make it unmistakably yours.</h2></Reveal>
        <p>Tell us where you are, how you want to live, and what the space should make possible.</p>
        <TextLink to="/contact/">Start a conversation</TextLink>
      </div>
      <RevealImage image={INQUIRY_IMAGE} className="inquiry-image" ratio="portrait" sizes="(max-width: 820px) 100vw, 42vw" />
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-contact">
          <span className="footer-label">Start a project</span>
          <a className="footer-email" href="mailto:originals@originalsinteriors.com"><span>originals@</span><span>originalsinteriors.com</span></a>
          <a className="footer-phone" href="tel:+34952863230">+34 952 863 230</a>
        </div>
        <div className="footer-address">
          <span className="footer-label">Visit the studio</span>
          <p>Urb. La Alcazaba S/N<br />29660 Marbella, Málaga<br />Spain</p>
          <a href="https://maps.google.com/?q=Urb.+La+Alcazaba+Marbella" target="_blank" rel="noreferrer">View on map <ArrowIcon /></a>
        </div>
      </div>
      <div className="footer-directory">
        <nav aria-label="Footer navigation">
          <Link to="/portfolio/">Projects</Link>
          <Link to="/services/">Services</Link>
          <Link to="/about/">Studio</Link>
          <Link to="/blog/">Journal</Link>
          <Link to="/contact/">Contact</Link>
        </nav>
        <div className="footer-social">
          <span className="footer-label">Follow</span>
          <a href="https://www.instagram.com/originalsinteriors/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer">Pinterest</a>
        </div>
        <a className="footer-top-link" href="#root">Back to top <span>↑</span></a>
      </div>
      <div className="footer-bottom">
        <span className="footer-copyright">© {new Date().getFullYear()} Originals Interiors</span>
        <div className="footer-signature">
          <Wordmark />
          <span>Spaces, shaped around you.</span>
        </div>
        <div className="footer-legal"><Link to="/privacy-policy/">Privacy</Link><span>Marbella / Worldwide</span></div>
      </div>
    </footer>
  );
}

function RouteScrollReset() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  return null;
}

function RoutedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageByPath(location.pathname);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (location.pathname !== normalizePath(location.pathname)) navigate(normalizePath(location.pathname), { replace: true });
  }, [location.pathname, navigate]);

  let content;
  if (location.pathname === "/") content = <HomePage />;
  else if (["/portfolio/", "/projects/", "/project/", "/portfolio/residential/", "/portfolio/commercial/", "/portfolio/3d-renders/"].includes(normalizePath(location.pathname))) content = <PortfolioPage page={page} />;
  else if (page?.kind === "project") content = <ProjectPage page={page} />;
  else if (normalizePath(location.pathname) === "/services/") content = <ServicesPage />;
  else if (page?.kind === "service") content = <ServicePage page={page} />;
  else if (normalizePath(location.pathname) === "/about/") content = <AboutPage />;
  else if (normalizePath(location.pathname) === "/our-creativity/") content = <CreativityPage />;
  else if (normalizePath(location.pathname) === "/blog/") content = <BlogPage />;
  else if (page?.kind === "article") content = <ArticlePage page={page} />;
  else if (normalizePath(location.pathname) === "/contact/") content = <ContactPage />;
  else if (page) content = <TextPage page={page} />;
  else content = <NotFound />;

  return (
    <AnimatePresence mode="wait">
      <m.main
        key={location.pathname}
        variants={PAGE_VARIANTS}
        initial={reduceMotion ? false : "initial"}
        animate={reduceMotion ? undefined : "enter"}
        exit={reduceMotion ? undefined : "exit"}
      >
        <RouteScrollReset />
        {content}
      </m.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <ScrollProgress />
      <Navigation />
      <RoutedPage />
      <Footer />
    </LazyMotion>
  );
}
