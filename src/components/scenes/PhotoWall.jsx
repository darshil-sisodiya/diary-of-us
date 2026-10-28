import { useMemo, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { allPhotos, asset, hasContent, text } from "../../utils/content.js";
import { useLoadedPhotos, useMediaQuery } from "../../hooks/useReducedMotion.js";
import { Heart } from "../Doodles.jsx";
import { SceneHeader } from "./SceneFrame.jsx";

const PINS = ["var(--rose)", "var(--lavender)", "var(--butter)", "var(--blue)", "var(--peach)"];

// Small seeded random so a layout is stable until she presses "shuffle".
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scatters the photos over a loose grid with a little jitter and tilt. */
function scatter(list, narrow, seed) {
  const rand = rng(seed);
  const cols = narrow ? 3 : 6;
  const rows = Math.max(1, Math.ceil(list.length / cols));
  const pw = narrow ? 31 : 14.5; // polaroid width, % of board
  const ph = narrow ? 23 : 31; // approx height, % of board
  const order = list.map((p) => p.key).sort(() => rand() - 0.5);
  const out = {};
  order.forEach((key, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const inRow = Math.min(cols, list.length - row * cols);
    const slot = col + (cols - inRow) / 2 + (row % 2 ? 0.25 : -0.15); // centre short rows, stagger the rest
    const x = (slot * (100 - pw)) / Math.max(1, cols - 1) + (rand() - 0.5) * 6;
    const y = (row * (100 - ph)) / Math.max(1, rows - 1) + (rand() - 0.5) * 9;
    out[key] = { x: Math.min(100 - pw, Math.max(0, x)), y: Math.min(100 - ph, Math.max(0, y)), r: (rand() - 0.5) * 16, z: i + 1 };
  });
  return out;
}

export default function PhotoWall() {
  const w = config.photoWall || {};
  const source = useMemo(() => {
    const extras = (w.extraPhotos || [])
      .filter((p) => p && hasContent(p.src))
      .map((p, i) => ({ key: `extra-${i}`, src: asset(p.src.trim()), alt: text(p.alt) || text(p.note) || "a photo of us", caption: text(p.note), focus: p.focus }));
    return [...(w.includeDiaryPhotos === false ? [] : allPhotos()), ...extras];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { ready, photos } = useLoadedPhotos(source);
  const narrow = useMediaQuery("(max-width: 700px)");
  const [seed, setSeed] = useState(7);
  const base = useMemo(() => scatter(photos, narrow, seed), [photos, narrow, seed]);
  const [moved, setMoved] = useState({}); // positions she has dragged, by key
  const [flipped, setFlipped] = useState(() => new Set());
  const [top, setTop] = useState(100);
  const [dragging, setDragging] = useState(null);
  const board = useRef(null);
  const drag = useRef(null);

  const shuffle = () => {
    setMoved({});
    setFlipped(new Set());
    setSeed((s) => s + 1);
  };

  const onDown = (e, key) => {
    if (e.button !== undefined && e.button !== 0) return;
    const pos = moved[key] || base[key];
    drag.current = { key, sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y, moved: false, rect: board.current.getBoundingClientRect() };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not supported for this pointer; dragging still works while over the photo */
    }
    setTop((t) => t + 1);
    setMoved((m) => ({ ...m, [key]: { ...pos, z: top + 1 } }));
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) setDragging(d.key);
    d.moved = true;
    setMoved((m) => ({
      ...m,
      [d.key]: { ...m[d.key], x: Math.min(92, Math.max(-6, d.x + (dx / d.rect.width) * 100)), y: Math.min(90, Math.max(-6, d.y + (dy / d.rect.height) * 100)) },
    }));
  };
  const onUp = () => {
    if (drag.current?.moved) drag.current.wasDrag = true;
    setDragging(null);
  };
  const onClick = (key) => {
    // A drag shouldn't count as a tap.
    if (drag.current?.wasDrag) {
      drag.current = null;
      return;
    }
    drag.current = null;
    setFlipped((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  return (
    <section className="wall-scene" aria-labelledby="scene-title">
      <SceneHeader section={w} />
      <div className="wall-frame">
        <div className="wall-board" ref={board}>
          {ready &&
            photos.map((p, i) => {
              const pos = moved[p.key] || base[p.key];
              if (!pos) return null;
              const isFlipped = flipped.has(p.key);
              const back = p.caption || p.pageTitle || "";
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`wall-photo ${isFlipped ? "is-flipped" : ""} ${dragging === p.key ? "is-dragging" : ""}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: pos.z, "--r": `${pos.r}deg`, "--pin": PINS[i % PINS.length], "--i": i }}
                  onPointerDown={(e) => onDown(e, p.key)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onClick={() => onClick(p.key)}
                  aria-label={`${p.alt}. ${isFlipped ? "Showing the back" : "Tap to flip"}`}
                  aria-pressed={isFlipped}
                >
                  <span className="wall-pin" aria-hidden="true" />
                  <span className="wall-card">
                    <span className="wall-front">
                      <img src={p.src} alt="" draggable="false" style={{ objectPosition: p.focus || "center" }} />
                    </span>
                    <span className="wall-back">
                      {back && <span className="wall-back-text">{back}</span>}
                      {p.dateLabel && <span className="wall-back-date">{p.dateLabel}</span>}
                      <Heart />
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      </div>
      <button type="button" className="btn btn-soft wall-shuffle" onClick={shuffle}>
        <Shuffle aria-hidden="true" />
        {text(w.shuffleText) || "shuffle"}
      </button>
    </section>
  );
}
