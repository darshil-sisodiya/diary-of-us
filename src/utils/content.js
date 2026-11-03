import { loveConfig as config } from "../data/loveConfig.js";

// "[ANYTHING WITH CAPITALS]" counts as an unedited placeholder and is never shown.
const PLACEHOLDER = /\[[^\]]*[A-Z]{2,}[^\]]*\]/;

export const LAYOUTS = [
  "polaroid-grid",
  "scrapbook-collage",
  "film-strip",
  "photo-grid",
  "featured-photo",
  "scattered-photos",
];
export const THEMES = ["rose", "peach", "lavender", "butter", "blue"];

export function hasContent(value) {
  if (value == null || value === false) return false;
  if (typeof value === "string") return value.trim() !== "" && !PLACEHOLDER.test(value);
  if (Array.isArray(value)) return value.some(hasContent);
  return true;
}

/**
 * Returns the display-ready string, or "" if it should be hidden.
 * Fills {her}, {you} and any extra {tokens}; if a token has no real value,
 * the whole line hides (so "for {her}" never shows as "for ").
 */
export function text(value, tokens = {}) {
  if (!hasContent(value)) return "";
  const all = { her: config.site?.herNickname, you: config.site?.yourNickname, ...tokens };
  let missing = false;
  const out = String(value).replace(/\{(\w+)\}/g, (match, key) => {
    if (!(key in all)) return match;
    if (!hasContent(String(all[key] ?? ""))) missing = true;
    return all[key];
  });
  return missing ? "" : out.trim();
}

/** A section is on only when its master switch AND its own `enabled` are not false. */
export function isOn(featureKey, section) {
  return config.features?.[featureKey] !== false && (section == null || section.enabled !== false);
}

/** Resolve "/images/x.jpg" against the site's base path so it works on any host. */
export function asset(src) {
  if (/^\/(?!\/)/.test(src)) return (import.meta.env?.BASE_URL ?? "/") + src.slice(1);
  return src;
}

/** Up to four real photos for a page (empty / placeholder paths removed). */
export function pagePhotos(page) {
  return (page.photos || [])
    .slice(0, 4)
    .filter((p) => p && hasContent(p.src))
    .map((p, i) => ({
      ...p,
      key: `${page.id}-${i}`,
      src: asset(p.src.trim()),
      alt: text(p.alt) || text(p.caption) || `${text(page.title) || "A memory"}, photo ${i + 1}`,
      caption: config.display?.photoCaptions === false ? "" : text(p.caption),
      stamp: config.display?.dateStamps === false ? "" : text(p.stamp),
    }));
}

/** Every diary photo (enabled pages only), tagged with its page title. */
export function allPhotos() {
  return (config.diary?.pages || [])
    .filter((p) => p && p.enabled !== false)
    .flatMap((page) => pagePhotos(page).map((p) => ({ ...p, pageTitle: text(page.title), dateLabel: text(page.dateLabel) })));
}

export function letterHasContent(note) {
  return [note.intro, note.closing, note.postscript, ...(note.paragraphs || [])].some((v) => text(v));
}

/**
 * The ordered list of book pages: cover → dates (with the letter placed
 * wherever loveNote.placement says) → ending.
 */
export function buildSequence() {
  const { diary = {}, loveNote = {}, ending = {}, cover = {} } = config;

  const dates = isOn("datePages", diary)
    ? (diary.pages || [])
        .filter((p) => p && p.enabled !== false)
        .map((page, i) => ({ type: "date", key: page.id || `date-${i}`, page, memory: i + 1 }))
    : [];
  const total = dates.length;
  dates.forEach((d) => (d.total = total));

  const note = isOn("loveNote", loveNote) && letterHasContent(loveNote) ? { type: "note", key: "note" } : null;
  const end = isOn("ending", ending) ? { type: "ending", key: "ending" } : null;

  const middle = [...dates];
  const at = loveNote.placement;
  if (note) {
    if (at === "afterCover") middle.unshift(note);
    else if (typeof at === "number" && at >= 1 && at < total) middle.splice(at, 0, note);
    else if (at !== "afterEnding") middle.push(note);
  }

  const seq = [];
  if (isOn("diaryCover", cover)) seq.push({ type: "cover", key: "cover" });
  seq.push(...middle);
  if (end) seq.push(end);
  if (note && at === "afterEnding") seq.push(note);
  return seq;
}

// Friendly hints for whoever is editing the config (development only, never shown to her).
if (import.meta.env?.DEV) {
  (config.diary?.pages || []).forEach((p, i) => {
    if (p.layout && !LAYOUTS.includes(p.layout))
      console.warn(`[loveConfig] Page ${i + 1}: unknown layout "${p.layout}". Using "${config.diary.defaultLayout}". Options: ${LAYOUTS.join(", ")}`);
    if (p.theme && !THEMES.includes(p.theme))
      console.warn(`[loveConfig] Page ${i + 1}: unknown theme "${p.theme}". Options: ${THEMES.join(", ")}`);
    if ((p.photos || []).length > 4) console.warn(`[loveConfig] Page ${i + 1}: only the first 4 photos are used.`);
  });
}
