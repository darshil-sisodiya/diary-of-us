import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { Heart, Sparkle } from "./Doodles.jsx";

const TINTS = ["var(--rose)", "var(--pink)", "var(--lavender)", "var(--peach)", "var(--butter)"];

/** A one-off puff of hearts/sparkles floating up and out from the centre of its parent. */
export function HeartBurst({ count = 9, kind = "mixed", spread = 130, rise = 90, className = "" }) {
  const { reduced, gentle } = useReducedMotion();
  const n = gentle ? Math.ceil(count / 2) : count;
  const parts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const dist = spread * (0.55 + Math.random() * 0.45);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.6 - rise,
          size: 10 + Math.random() * 12,
          delay: Math.random() * 0.25,
          spin: (Math.random() - 0.5) * 50,
          sparkle: kind === "sparkle" || (kind === "mixed" && i % 3 === 0),
          color: TINTS[i % TINTS.length],
        };
      }),
    [n, kind, spread, rise]
  );
  if (reduced) return null;

  return (
    <span className={`burst ${className}`} aria-hidden="true">
      {parts.map((p, i) => {
        const Icon = p.sparkle ? Sparkle : Heart;
        return (
          <motion.span
            key={i}
            className="burst-bit"
            style={{ width: p.size, height: p.size, color: p.color }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1.15, 1], opacity: [0, 1, 1, 0], rotate: p.spin }}
            transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
          >
            <Icon />
          </motion.span>
        );
      })}
    </span>
  );
}

/** A tiny heart pops wherever she clicks or taps. */
export function ClickHearts() {
  const { reduced } = useReducedMotion();
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (reduced) return;
    let id = 0;
    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const heart = { id: ++id, x: e.clientX, y: e.clientY, color: TINTS[id % TINTS.length] };
      setHearts((h) => [...h.slice(-5), heart]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== heart.id)), 900);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [reduced]);

  return (
    <div className="click-hearts" aria-hidden="true">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            className="click-heart"
            style={{ left: h.x, top: h.y, color: h.color }}
            initial={{ scale: 0.2, opacity: 0, y: 0 }}
            animate={{ scale: [0.2, 1.2, 1], opacity: [0, 1, 0], y: -36 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <Heart />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
