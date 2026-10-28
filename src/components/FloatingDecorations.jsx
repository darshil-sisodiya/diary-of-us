import { useMemo } from "react";
import { loveConfig as config } from "../data/loveConfig.js";
import { useMediaQuery, useReducedMotion } from "../hooks/useReducedMotion.js";
import { DOODLES } from "./Doodles.jsx";

const COLORS = ["var(--pink)", "var(--rose)", "var(--lavender)", "var(--peach)", "var(--butter)", "var(--blue)"];
const COUNT = { low: 10, medium: 16, high: 24 };

// Decorations live in the outer margins (left/right bands + top/bottom edges)
// so they never sit on top of the diary's text or photos.
function spot(i) {
  const side = i % 4;
  const r = Math.random();
  if (side === 0) return { left: `${r * 11}%`, top: `${5 + Math.random() * 90}%` };
  if (side === 1) return { left: `${89 + r * 9}%`, top: `${5 + Math.random() * 90}%` };
  if (side === 2) return { left: `${12 + r * 76}%`, top: `${Math.random() * 6}%` };
  return { left: `${12 + r * 76}%`, top: `${94 + Math.random() * 5}%` };
}

export default function FloatingDecorations() {
  const { reduced, gentle } = useReducedMotion();
  const small = useMediaQuery("(max-width: 700px)");
  const types = (config.decorations?.types || []).filter((t) => DOODLES[t]);

  let count = COUNT[config.decorations?.density] ?? COUNT.medium;
  if (gentle) count = Math.round(count * 0.6);
  if (small) count = Math.round(count * 0.5);

  const items = useMemo(
    () =>
      types.length
        ? Array.from({ length: count }, (_, i) => ({
            Icon: DOODLES[types[i % types.length]],
            color: COLORS[i % COLORS.length],
            size: 12 + Math.random() * 16,
            delay: -Math.random() * 20,
            duration: 14 + Math.random() * 12,
            drift: `${(Math.random() - 0.5) * 40}px`,
            ...spot(i),
          }))
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, types.join()]
  );

  return (
    <div className={`floaties ${reduced ? "is-still" : ""}`} aria-hidden="true">
      {items.map(({ Icon, color, size, delay, duration, drift, left, top }, i) => (
        <span
          key={i}
          className="floaty"
          style={{ left, top, color, width: size, height: size, "--drift": drift, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        >
          <Icon />
        </span>
      ))}
    </div>
  );
}
