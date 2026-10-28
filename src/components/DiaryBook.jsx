import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loveConfig as config } from "../data/loveConfig.js";
import { buildSequence, text } from "../utils/content.js";
import { playPageTurn } from "../utils/sound.js";
import { useMediaQuery, useReducedMotion, useSwipe } from "../hooks/useReducedMotion.js";
import DiaryCover from "./DiaryCover.jsx";
import DiaryPage from "./DiaryPage.jsx";
import LoveNote from "./LoveNote.jsx";
import FinalSurprise from "./FinalSurprise.jsx";
import NavigationControls from "./NavigationControls.jsx";
import { Heart } from "./Doodles.jsx";

// Page transitions. "flip" turns the page around the spine like a real book.
const turn = {
  enter: ({ dir, mode }) =>
    mode === "flip"
      ? dir > 0
        ? { opacity: 0, rotateY: 6, x: 16 }
        : { opacity: 0.2, rotateY: -80 }
      : mode === "slide"
        ? { opacity: 0, x: dir * 48 }
        : { opacity: 0 },
  center: {
    opacity: 1,
    rotateY: 0,
    x: 0,
    transition: { type: "spring", stiffness: 90, damping: 17, opacity: { duration: 0.3 } },
  },
  exit: ({ dir, mode }) =>
    mode === "flip"
      ? dir > 0
        ? { opacity: 0, rotateY: -88, transition: { duration: 0.5, ease: [0.5, 0.05, 0.7, 0.3] } }
        : { opacity: 0, x: 16, rotateY: 6, transition: { duration: 0.3 } }
      : mode === "slide"
        ? { opacity: 0, x: dir * -48, transition: { duration: 0.25 } }
        : { opacity: 0, transition: { duration: 0.25 } },
};

export default function DiaryBook({ hasIntro }) {
  const seq = useMemo(buildSequence, []);
  const [[index, dir], setPage] = useState([0, 0]);
  const { reduced, gentle } = useReducedMotion();
  const phone = useMediaQuery("(max-width: 700px)");
  const book = useRef(null);
  const nav = config.navigation || {};

  const go = useCallback(
    (i) => {
      if (i < 0 || i >= seq.length || i === index) return;
      setPage([i, i > index ? 1 : -1]);
      if (config.sounds?.pageTurn) playPageTurn(config.sounds.volume);
    },
    [index, seq.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // After turning a page, bring the top of the book back into view (matters on phones).
  useEffect(() => {
    if (dir === 0 || !book.current) return;
    if (book.current.getBoundingClientRect().top < 0)
      book.current.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [index, dir, reduced]);

  const swipe = useSwipe(
    () => go(index + 1),
    () => go(index - 1)
  );

  if (!seq.length)
    return (
      <p className="diary-empty">
        <Heart />
      </p>
    );

  const item = seq[index];
  const mode = reduced ? "fade" : phone || gentle ? "slide" : config.animation?.pageTransition || "flip";
  const custom = { dir, mode };
  const coverIndex = seq.findIndex((s) => s.type === "cover");
  const firstMemory = seq.findIndex((s) => s.type === "date");

  const pageNumber = item.type === "cover" ? 0 : index + (coverIndex >= 0 ? 0 : 1);
  const pageLabel = config.display?.pageNumbers !== false ? text(nav.pageNumber, { page: pageNumber }) : "";

  const render = () => {
    if (item.type === "cover") return <DiaryCover onStart={() => go(index + 1)} headingLevel={hasIntro ? 2 : 1} />;
    if (item.type === "date") return <DiaryPage item={item} />;
    if (item.type === "note") return <LoveNote />;
    return (
      <FinalSurprise
        onRestart={() => go(coverIndex >= 0 ? coverIndex : 0)}
        onMemories={() => go(firstMemory)}
        restartLabel={text(nav.readAgain)}
        memoriesLabel={firstMemory >= 0 && coverIndex >= 0 ? text(nav.backToMemories) : ""}
      />
    );
  };

  return (
    <motion.section
      className="diary"
      aria-label={text(config.cover?.title) || text(config.site?.title) || "Diary"}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
    >
      <div className="book" ref={book} {...swipe}>
        <AnimatePresence mode="wait" custom={custom} initial={false}>
          <motion.div
            key={item.key}
            className={item.type === "cover" ? "turn turn--cover" : `turn sheet sheet--${item.type}`}
            custom={custom}
            variants={turn}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {item.type !== "cover" && <span className="sheet-ribbon" aria-hidden="true" />}
            {render()}
            {pageLabel && pageNumber > 0 && (
              <p className="page-number" aria-hidden="true">
                {pageLabel}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {item.type !== "cover" && <NavigationControls seq={seq} index={index} onGo={go} />}

      <p className="sr-only" aria-live="polite">
        {item.type === "cover" ? "" : `Page ${pageNumber} of ${seq.length - (coverIndex >= 0 ? 1 : 0)}`}
      </p>
    </motion.section>
  );
}
