import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loveConfig as config } from "../data/loveConfig.js";
import Lightbox from "./Lightbox.jsx";
import { Heart, Star, Sparkle } from "./Doodles.jsx";

function Photo({ photo, index, onFail, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  const Frame = onOpen ? "button" : "div";
  const frameProps = onOpen ? { type: "button", onClick: onOpen, "aria-label": `View larger: ${photo.alt}` } : {};

  return (
    <motion.figure
      className={`photo ${loaded ? "is-loaded" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.09, type: "spring", stiffness: 140, damping: 18 }}
    >
      <Frame className="photo-frame" {...frameProps}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          draggable="false"
          onLoad={() => setLoaded(true)}
          onError={onFail}
          style={{ objectFit: photo.fit === "contain" ? "contain" : "cover", objectPosition: photo.focus || "center" }}
        />
        {photo.stamp && <span className="photo-stamp">{photo.stamp}</span>}
      </Frame>
      <span className="photo-tape" aria-hidden="true" />
      <span className="photo-tape photo-tape--b" aria-hidden="true" />
      <span className="photo-pin" aria-hidden="true" />
      <Heart className="photo-sticker" />
      {photo.caption && <figcaption className="photo-caption">{photo.caption}</figcaption>}
    </motion.figure>
  );
}

/** Shown when a page has no (working) photos, so it still looks intentional. */
function EmptyScrapbook() {
  return (
    <div className="empty-scrapbook" aria-hidden="true">
      <span className="photo-tape" />
      <span className="photo-tape photo-tape--b" />
      <svg viewBox="0 0 60 110" className="doodle pressed-flower">
        <path className="doodle-line" d="M30 105C29 80 32 60 30 36" strokeWidth="1.4" />
        <ellipse cx="22" cy="78" rx="8" ry="3.4" transform="rotate(-30 22 78)" style={{ fill: "var(--leaf)" }} />
        <ellipse cx="38" cy="64" rx="8" ry="3.4" transform="rotate(30 38 64)" style={{ fill: "var(--leaf)" }} />
        <g transform="translate(15 8) scale(1.25)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="12" cy="6.6" rx="3.5" ry="4.4" transform={`rotate(${a} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="2.9" className="doodle-center" />
        </g>
      </svg>
      <Heart className="empty-heart empty-heart--a" />
      <Heart className="empty-heart empty-heart--b" />
      <Star className="empty-star" />
      <Sparkle className="empty-sparkle twinkle" />
    </div>
  );
}

export default function PhotoGallery({ photos, layout }) {
  const [failed, setFailed] = useState(() => new Set());
  const [open, setOpen] = useState(null);
  const visible = photos.filter((p) => !failed.has(p.key));
  const lightbox = config.features?.photoLightbox !== false;

  if (!visible.length) return <EmptyScrapbook />;

  return (
    <>
      <div
        className={`gallery gallery--${layout}`}
        data-count={visible.length}
        data-stickers={config.display?.stickers === false ? "off" : "on"}
      >
        {visible.map((p, i) => (
          <Photo
            key={p.key}
            photo={p}
            index={i}
            onFail={() => setFailed((s) => new Set(s).add(p.key))}
            onOpen={lightbox ? () => setOpen(i) : null}
          />
        ))}
      </div>
      <AnimatePresence>
        {open != null && visible[open] && (
          <Lightbox photos={visible} index={open} onChange={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
