import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { loveConfig as config } from "../data/loveConfig.js";
import { useSwipe } from "../hooks/useReducedMotion.js";

export default function Lightbox({ photos, index, onChange, onClose }) {
  const dialog = useRef(null);
  const closeBtn = useRef(null);
  const n = photos.length;
  const photo = photos[index];
  const prev = () => onChange((index - 1 + n) % n);
  const next = () => onChange((index + 1) % n);
  const swipe = useSwipe(next, prev);
  const nav = config.navigation || {};

  // Focus the close button, lock page scroll, and restore focus when closed.
  useEffect(() => {
    const before = document.activeElement;
    closeBtn.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, []);

  // Capture phase + preventDefault so the diary's own arrow-key paging ignores these keys.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && n > 1) next();
      else if (e.key === "ArrowLeft" && n > 1) prev();
      else if (e.key === "Tab") {
        const els = [...dialog.current.querySelectorAll("button")];
        const i = els.indexOf(document.activeElement);
        const j = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i + 1) % els.length;
        els[j]?.focus();
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return createPortal(
    <motion.div
      ref={dialog}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || photo.alt}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={photo.key}
          className="lightbox-figure"
          initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          {...swipe}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            style={{ objectPosition: photo.focus || "center" }}
            draggable="false"
          />
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </motion.figure>
      </AnimatePresence>

      <button ref={closeBtn} type="button" className="icon-btn lightbox-close" onClick={onClose} aria-label={nav.closePhoto || "Close photo"}>
        <X aria-hidden="true" />
      </button>
      {n > 1 && (
        <>
          <button type="button" className="icon-btn lightbox-prev" onClick={prev} aria-label={nav.previousPhoto || "Previous photo"}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn lightbox-next" onClick={next} aria-label={nav.nextPhoto || "Next photo"}>
            <ChevronRight aria-hidden="true" />
          </button>
          <p className="lightbox-count" aria-live="polite">
            {index + 1} / {n}
          </p>
        </>
      )}
    </motion.div>,
    document.body
  );
}
