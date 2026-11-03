// `npm run check` — checks loveConfig.js and tells you what's still left to personalise.
// It also self-tests the "hide empty / placeholder content" rules the site relies on.
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { loveConfig as config } from "../src/data/loveConfig.js";
import { hasContent, text, buildSequence, LAYOUTS } from "../src/utils/content.js";
import { score } from "../src/utils/wordle.js";

// ---- 1. Self-test of the helpers -------------------------------------------
assert.equal(hasContent("[WRITE YOUR LOVE LETTER HERE]"), false);
assert.equal(hasContent("   "), false);
assert.equal(hasContent(null), false);
assert.equal(hasContent("I love you [sic]"), true); // lowercase brackets are allowed
assert.equal(hasContent(["", "[PLACEHOLDER]"]), false);
assert.equal(text("Memory {current} of {total}", { current: 2, total: 4 }), "Memory 2 of 4");
assert.equal(text("for {her}", { her: "[HER NICKNAME]" }), "");
assert.equal(text("for {her}", { her: "Bunny" }), "for Bunny");

const original = structuredClone(config);
const types = () => buildSequence().map((s) => s.type).join(",");
// Test against a known setup, whatever your own config currently switches off.
Object.assign(config.features, { diaryCover: true, datePages: true, loveNote: true, ending: true });
[config.cover, config.diary, config.loveNote, config.ending].forEach((s) => (s.enabled = true));
config.diary.pages.forEach((p) => (p.enabled = true));
config.loveNote.paragraphs = ["hello"];
config.loveNote.placement = "beforeEnding";
assert.equal(types(), "cover,date,date,date,date,date,note,ending");
config.loveNote.placement = 2;
assert.equal(types(), "cover,date,date,note,date,date,date,ending");
config.loveNote.placement = "afterEnding";
assert.equal(types(), "cover,date,date,date,date,date,ending,note");
config.loveNote.enabled = false;
assert.equal(types(), "cover,date,date,date,date,date,ending");
config.features.diaryCover = false;
config.diary.pages[1].enabled = false;
assert.equal(types(), "date,date,date,date,ending");
Object.assign(config, structuredClone(original));
assert.deepEqual(score("hello", "world"), ["miss", "miss", "miss", "hit", "near"]); // repeated letters
assert.deepEqual(score("speed", "abide"), ["miss", "miss", "near", "miss", "near"]);
assert.deepEqual(score("cutie", "cutie"), ["hit", "hit", "hit", "hit", "hit"]);
console.log("✓ helper self-test passed");

// ---- 2. What's left to personalise ------------------------------------------
const todo = [];
const walk = (value, path) => {
  if (typeof value === "string") {
    if (/\[[^\]]*[A-Z]{2,}[^\]]*\]/.test(value) && !path.endsWith("googleFontsUrl")) todo.push(path);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, Array.isArray(value) ? `${path}[${k}]` : `${path}.${k}`);
  }
};
walk(config, "loveConfig");

const missingPhotos = [];
config.diary.pages.forEach((page, i) => {
  if (page.layout && !LAYOUTS.includes(page.layout)) console.log(`⚠ page ${i + 1}: unknown layout "${page.layout}"`);
  (page.photos || []).forEach((p) => {
    if (hasContent(p.src) && p.src.startsWith("/") && !existsSync(new URL(`../public${p.src}`, import.meta.url)))
      missingPhotos.push(p.src);
  });
});
const exists = (src) => existsSync(new URL(`../public${src}`, import.meta.url));
(config.photoWall?.extraPhotos || []).map((p) => p.src)
  .filter((src) => hasContent(src) && src.startsWith("/") && !exists(src))
  .forEach((src) => missingPhotos.push(src));

const song = config.music?.src;
if (config.music?.enabled !== false && hasContent(song) && !existsSync(new URL(`../public${song}`, import.meta.url)))
  console.log(`♪ no song file yet at public${song} (the music button stays hidden until you add one)`);

console.log(todo.length ? `\n${todo.length} placeholder(s) still hidden from her:\n  ${todo.join("\n  ")}` : "\n✓ no placeholders left");
console.log(missingPhotos.length ? `\n${missingPhotos.length} photo file(s) not added yet:\n  ${missingPhotos.join("\n  ")}` : "\n✓ all photo files found");
