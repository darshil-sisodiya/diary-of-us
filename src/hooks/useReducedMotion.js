import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { loveConfig as config } from "../data/loveConfig.js";

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/**
 * Combines the visitor's "reduce motion" setting with loveConfig.animation.
 *   reduced → no movement at all (opacity fades only)
 *   gentle  → softer, fewer decorations
 */
export function useReducedMotion() {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const intensity = config.animation?.intensity || "full";
  const reduced = prefersReduced || intensity === "off";
  return { reduced, gentle: reduced || intensity === "gentle" };
}

/** Horizontal swipe on touch screens. Returns props to spread on an element. */
export function useSwipe(onLeft, onRight) {
  const start = useRef(null);
  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      dx < 0 ? onLeft?.() : onRight?.();
    },
  };
}

/** Preloads photos and returns only the ones that actually load (missing files drop out). */
export function useLoadedPhotos(photos) {
  const key = photos.map((p) => p.src).join("|");
  const [state, setState] = useState({ key: null, loaded: [] });
  useEffect(() => {
    let alive = true;
    Promise.all(
      photos.map(
        (p) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ...p, ratio: img.naturalWidth / img.naturalHeight });
            img.onerror = () => resolve(null);
            img.src = p.src;
          })
      )
    ).then((list) => alive && setState({ key, loaded: list.filter(Boolean) }));
    return () => (alive = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { ready: state.key === key, photos: state.key === key ? state.loaded : [] };
}

/** Reveals `full` one character at a time (instantly when motion is reduced). */
export function useTypewriter(full, run, reduced, speed = 32) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!run) return setCount(0);
    if (reduced) return setCount(full.length);
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= full.length) clearInterval(id);
        return Math.min(c + 1, full.length);
      });
    }, speed);
    return () => clearInterval(id);
  }, [full, run, reduced, speed]);
  return full.slice(0, count);
}
