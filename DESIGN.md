---
name: "Originals Interiors"
description: "Sunlit architectural confidence for an international interiors studio."
colors:
  limestone: "oklch(96% 0.012 82)"
  chalk: "oklch(99% 0.006 82)"
  bone: "oklch(91% 0.014 78)"
  ink: "oklch(19% 0.012 55)"
  graphite: "oklch(34% 0.012 55)"
  olive: "oklch(41% 0.045 110)"
  rust: "oklch(55% 0.12 39)"
  clay: "oklch(68% 0.075 58)"
  sand: "oklch(73% 0.045 78)"
typography:
  display:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, Arial, sans-serif"
    fontSize: "clamp(3.1rem, 6.2vw, 6.8rem)"
    fontWeight: 470
    lineHeight: 0.92
    letterSpacing: "-0.052em"
  headline:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4.75rem)"
    fontWeight: 470
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(1.35rem, 2.2vw, 2.2rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(1rem, 1.1vw, 1.18rem)"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  none: "0px"
  hairline: "2px"
  soft: "6px"
  pill: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  6: "1.5rem"
  8: "2rem"
  12: "3rem"
  16: "4rem"
  24: "6rem"
  32: "8rem"
  section: "clamp(6rem, 13vw, 13rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "1.15rem 1.6rem"
  button-primary-hover:
    backgroundColor: "{colors.rust}"
    textColor: "{colors.chalk}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0"
  image-frame:
    backgroundColor: "{colors.bone}"
    rounded: "{rounded.hairline}"
---

# Design System: Originals Interiors

## 1. Overview

**Creative North Star: "The Sunlit Monolith"**

The interface feels like entering a rigorously composed villa in late-afternoon Marbella light. Pale mineral surfaces form the quiet architecture; dark structural lines create rhythm; photography supplies life, colour, texture, and proof. The system is modern and minimal, but never anonymous.

The scene is an international client reviewing the studio on an iPad beside a sunlit terrace, looking for a partner capable of handling an exacting project with calm authority. This forces a light mineral theme, image-led pages, decisive proportions, and generous negative space. It rejects generic beige luxury, theatrical black-and-gold styling, and fashion-editorial imitation.

The layout uses a fluid 12-column grid with `clamp(1rem, 3vw, 3.5rem)` page gutters, an 84rem content measure, and intentional full-bleed image breaks. Desktop compositions may span 4/8, 5/7, or 7/5 columns; mobile collapses to one column without preserving decorative asymmetry. Sections use the spacing token `section`, while content within a thought stays tightly grouped.

Motion is choreographed but quiet. Page entry, direct element reveals, and scroll-linked depth use transforms and opacity only, with no bounce. Each route should feel spatial, never busy.

The global reveal language moves the content itself. Primary headings rise gently through their clipped bounds, supporting copy enters with a shorter vertical drift, and photography settles through restrained position, scale, and opacity changes. Never animate a cover, colour block, veil, or decorative shape over content. These shared primitives keep desktop and mobile in one motion voice.

**Key Characteristics:**

- Photography first, interface second.
- Mineral light surfaces with ink-black structure.
- Rare rust accents sampled from furniture and warm metals.
- Controlled architectural display typography balanced by compact functional labels.
- Asymmetry used to pace project stories, not as decoration.
- Flat surfaces at rest, tactile lift only during interaction.

## 2. Colors

The palette borrows from limestone, timber, shaded joinery, planting, and oxidized upholstery found in the portfolio photography. Images are allowed to carry most chroma.

### Primary

- **Ink Structure:** The default text, navigation, footer, and decisive action surface. It provides architectural contrast without using absolute black.
- **Sunlit Limestone:** The primary page ground. Its slight warmth keeps white space physical rather than clinical.

### Secondary

- **Oxidized Rust:** A rare action and editorial accent sampled from red and coral upholstery. Use on no more than 8% of a page.
- **Sun-Warmed Clay:** A dedicated closing surface for project invitations. It bridges pale mineral pages and the dark footer without competing with photography.
- **Garden Olive:** A contextual accent for location, sustainability, and outdoor work; never pair it with rust in the same compact component.

### Tertiary

- **Warm Sand:** Captions, map details, quiet section grounds, and material-oriented storytelling.

### Neutral

- **Gallery Chalk:** Image mats, elevated text fields, and light-on-dark text.
- **Soft Bone:** Dividers, loading grounds, muted blocks, and hover underlays.
- **Graphite:** Supporting copy, timestamps, and subdued navigation.

### Named Rules

**The Photography Owns Colour Rule.** Interface colour stays restrained so rooms, materials, artwork, planting, and people remain the most chromatic elements.

**The Rust Rarity Rule.** Oxidized Rust is reserved for an active choice, a precise detail, or one memorable moment per viewport. If it appears everywhere, it has failed.

**The No Section Numbers Rule.** Never prefix section labels, eyebrows, headings, or navigation groups with decorative sequence numbers such as `01`, `02`, or `03`. Labels stand on their wording and position alone. Numbering is permitted only when the number is real content, such as a year, quantity, address, ordered process, or project metadata.

## 3. Typography

**Display Font:** Hanken Grotesk Variable (with Arial and sans-serif fallbacks)  
**Body Font:** Manrope (with Arial and sans-serif fallbacks)
**Signature Font:** Prata (wordmark and isolated quotation marks only)

**Character:** Hanken Grotesk gives headings a quiet architectural structure with less visual ceremony and much better control at medium sizes. Manrope stays open and calm through long service and project narratives. Prata is isolated as a signature voice, preserving the existing wordmark without turning every page into a magazine cover.

### Hierarchy

- **Display** (470, fluid 3.1rem to 6.8rem, 0.92): Home hero and one dominant statement per major landing page.
- **Headline** (470, fluid 2.25rem to 4.75rem, 0.98): Section openings and project titles.
- **Title** (500, fluid 1.35rem to 2.2rem, 1.15): Service names, project list titles, and navigation panels.
- **Body** (400, fluid 1rem to 1.18rem, 1.65): Narrative and practical information, capped at 68ch.
- **Testimonial** (450, fluid 1.4rem to 2.45rem, 1.24): Client quotations only. It must remain clearly below Headline scale and pair with a compact attributed Label.
- **Label** (600, 0.72rem, 0.16em tracking): Short navigation, categories, metadata, and actions. Uppercase is limited to labels of five words or fewer.

### Named Rules

**The Signature Serif Rule.** Prata is reserved for the wordmark and isolated quotation punctuation. Display headings use Hanken Grotesk so the site remains architectural, not editorial.

**The Optical Edge Rule.** Large headlines may align optically beyond the text column, while body copy always locks to the grid.

## 4. Elevation

The system is flat by default. Depth comes from full-bleed imagery, tonal transitions, overlap, and motion. Shadows appear only when an interactive image or navigation surface lifts from the page.

### Shadow Vocabulary

- **Image Lift** (`0 24px 70px oklch(19% 0.012 55 / 0.14)`): Applied only to a hovered project preview or active media panel.
- **Navigation Veil** (`0 16px 48px oklch(19% 0.012 55 / 0.12)`): Used by the open mobile or desktop menu panel.
- **Focus Halo** (`0 0 0 3px oklch(55% 0.12 39 / 0.28)`): Keyboard focus reinforcement around compact controls.

### Named Rules

**The Flat Until Touched Rule.** Surfaces have no resting shadow. Lift is a response to interaction and disappears when the interaction ends.

## 5. Components

Components behave like fitted architectural details: precise, calm, and integrated into the composition.

### Buttons

- **Shape:** Square-cut with only a 2px optical softening where needed.
- **Primary:** Ink Structure ground, Gallery Chalk label, 1.15rem by 1.6rem padding.
- **Hover / Focus:** The inner label shifts 2px and the ground becomes Oxidized Rust over 320ms with an exponential ease-out. Focus uses the Focus Halo.
- **Ghost:** Transparent with a 1px underline that expands from left to right; no pill containers.

### Chips

- **Style:** Text-only project filters separated by space and a quiet 1px baseline.
- **State:** Active filters use Ink Structure text and a full underline; inactive filters use Graphite and gain contrast on hover.

### Cards / Containers

- **Corner Style:** Images use 2px corners; text containers remain square.
- **Background:** Gallery Chalk or transparent on Sunlit Limestone.
- **Shadow Strategy:** No resting shadow. Image Lift is available during hover.
- **Border:** Hairline Bone dividers only where grouping is otherwise unclear.
- **Internal Padding:** Use 1.5rem on compact stories and fluid 2rem to 4rem on feature stories.

### Inputs / Fields

- **Style:** Gallery Chalk ground, square corners, no visible border at rest, generous 1rem vertical padding.
- **Focus:** Ink Structure 1px outline plus Focus Halo.
- **Error / Disabled:** Error copy uses Oxidized Rust; disabled states use Bone and Graphite without reducing opacity below legibility.

### Navigation

- **Style:** A slim persistent wordmark bar becomes an architectural full-screen menu. Primary destinations use the Headline role; utility links use Label.
- **Hover / Active:** Links reveal a thumbnail or underline with transforms and opacity. Active state never relies on colour alone.
- **Open / Close:** Each destination itself rises through a clipped row with a short stagger. Closing reverses the text movement before the panel leaves. Use transforms and opacity only, with no spring or bounce.
- **Mobile:** Full-viewport menu with large tap targets, scroll lock, and sequential reveal. Close control occupies the same position as the menu control.
- **Route changes:** The outgoing page fades and settles upward at its current scroll position. Only after it leaves does the incoming page reset both the native document position and the smooth-scroll controller, synchronously before its first paint, then resolve upward into view. Never reset while the outgoing route remains visible, since that exposes its hero as a flash. Same-page logo clicks may retain the intentional smooth return.

### Project Index

Projects alternate between expansive landscape frames and taller detail crops. The index must not become an identical card grid. Each item includes project title, location or category, year when available, and a clear route into the project story.

### Service Directory

The homepage and Services route share one service-directory component and the same curated image assigned to each discipline. Desktop uses a calm text directory paired with one sticky image that changes on hover or keyboard focus. On the Services route, mobile replaces hover-dependent previewing with an editorial image, title, description, and direct route for every discipline. The mobile images must never be hidden, substituted with generic thumbnails, or detached from their corresponding service.

The Services introduction uses an asymmetric pair of real project images and a compact statement of the integrated process. Avoid generic service cards, icon grids, counters, or a repeated full-width banner before the directory.

### Image Reveal

Images are visible by default against Soft Bone. On first entry, the image itself settles from 1.035 to 1.0 while opacity and vertical position resolve. No veil, mask, accent plane, or decorative shape crosses the image. Visibility never depends on an intersection observer or animation completing.

### Global Reveal Motion

- **Titles:** The heading itself settles upward by 34px over 820ms using `cubic-bezier(.16, 1, .3, 1)`.
- **Supporting text and labels:** The content itself settles upward by 28px over 720ms with the same exponential curve.
- **Images:** The figure resolves from 0.35 opacity and a 28px vertical offset over 720ms, while the image itself scales from 1.035 to 1 over 920ms.
- **Stagger:** Delay related blocks by 60–120ms. Do not stagger individual words or letters.
- **Viewport:** Play once when roughly 12% of the element enters view. Content remains visible by default if scripting or observation is unavailable.
- **Reduced motion:** Remove transforms, scale, opacity transitions, and delay when `prefers-reduced-motion` is enabled.
- **No passing shapes:** Never move a solid plane, coloured block, veil, or wipe across text, imagery, cards, or navigation.
- **Prohibited:** Springs, bounce, elastic easing, blur reveals, and long chains that hold content hidden.

### Project Invitation

The global closing invitation uses Sun-Warmed Clay with one warm, tactile project photograph. Copy remains architectural and compact, with a clear narrative sentence and a single underlined action. It bridges the pale project pages and the Ink Structure footer without a harsh colour break.

### Supplier Library

The homepage preserves the complete supplier network as a quiet materials-library wall, never as a generic autoplay logo carousel. All partner marks appear in their original proportions, normalized through restrained grayscale, increased tonal separation, multiply blending, and a consistent optical area. The normalization must dissolve off-white raster backgrounds into the mineral surface without tracing, replacing, or distorting the original logos. Desktop uses seven columns; tablet uses four; mobile uses three. Hairline dividers provide structure without turning marks into cards. Each logo itself resolves through the shared direct-element reveal and becomes slightly more present on hover.

Eichholtz receives a compact preferred-partner feature after the full library, including the original partnership context and an external route to the brand. The feature remains subordinate to project imagery and does not become a promotional billboard.

### Worldwide Locations

Every Worldwide destination pairs its country name and project cities with a geographically accurate, simplified SVG silhouette. Shapes use Natural Earth boundary geometry and a darker Warm Sand mixture, `color-mix(in oklch, var(--sand) 72%, var(--graphite))`. Each path preserves its source geographic aspect ratio inside the shared optical box; never stretch every country to the same width. The map remains secondary to the label and may only gain slight opacity and direct transform movement on hover. Never substitute flags, generic blobs, pins, globes, or mismatched country outlines.

### About Legacy Feature

The About page uses one evidence-led studio feature in place of an abstract value strip. A warm mineral surface pairs a real project photograph with the studio’s founding year, Puerto Banús location, project sectors, integrated disciplines, and a route to visit the team. Facts appear as quiet directory rows, not oversized metrics or unsupported slogans. Never reintroduce equal dark panels containing generic claims such as “Bespoke thinking” or “International perspective.”

### Footer

The footer is an asymmetric contact directory on Ink Structure. The project email is the primary gesture, while address, navigation, social links, and legal details remain quiet and spatially separated. The wordmark appears only as a small closing signature. Never reintroduce an oversized footer-logo billboard or a generic four-column sitemap grid.

On mobile, the email remains a display gesture at 1.75rem to 2.2rem rather than collapsing into utility text. The lower footer follows a deliberate closing rhythm: one compact horizontal navigation band, a larger two-column social group, a full-width back-to-top action, then a ruled signature block with the wordmark, brand line, copyright, and legal details. All footer content keeps the fixed 1rem page gutter. At narrow widths, navigation type may scale down within the Label-to-Body range, but the row must not overflow or collapse into an accidental orphan link.

### Mobile Composition

Contained mobile content always uses a 1rem left and right gutter. Full-bleed colour and photography may reach the viewport edge, but their text and controls remain aligned to that gutter. Article bullets are grouped in semantic lists and indented inside the prose column so their markers never escape the gutter. Desktop asymmetry never survives by shrinking random mobile items; portfolio, journal, and gallery media become full-width within the content column. On Contact, the order is image, form, then studio information.

## 6. Do's and Don'ts

### Do:

- **Do** let original project photography occupy at least half of every portfolio-led viewport.
- **Do** use the 12-column grid and vary 4/8, 5/7, and 7/5 compositions to create rhythm.
- **Do** cap body copy at 68ch and separate long thoughts with the 6 or 8 spacing token.
- **Do** animate only transform, opacity, or Framer Motion values derived without React state.
- **Do** preserve source image aspect ratios and choose deliberate crops per breakpoint.
- **Do** keep navigation, inquiry actions, and contact details available from every route.

### Don't:

- **Don't** create a generic beige luxury website that removes all personality in the name of restraint.
- **Don't** use theatrical black-and-gold styling, glossy gradients, glass panels, or faux exclusivity.
- **Don't** reproduce dense WordPress portfolio grids, miniature thumbnails, or navigation that exposes every page at once.
- **Don't** imitate fashion-editorial layouts with italic serif headlines, tiny monospace labels, or rule-heavy magazine compositions.
- **Don't** use gradient text, decorative glassmorphism, identical icon cards, coloured side-stripe borders, or nested cards.
- **Don't** use bounce, elastic motion, or animation delays that make content feel withheld.
- **Don't** use decorative numbered section labels such as `01 The Studio`; this pattern is prohibited across every current and future route.
