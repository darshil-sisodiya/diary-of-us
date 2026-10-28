import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { text } from "../../utils/content.js";

/** Wraps every page you open from the room: entrance animation + "back to our room". */
export default function SceneFrame({ onBack, children }) {
  const label = text(config.room?.backLabel) || "back";
  return (
    <motion.div
      className="scene"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 17 }}
    >
      {onBack && (
        <button type="button" className="btn btn-soft scene-back" onClick={onBack}>
          <ChevronLeft aria-hidden="true" />
          <span>{label}</span>
        </button>
      )}
      {children}
    </motion.div>
  );
}

/** Handwritten title + subtitle used at the top of each scene. */
export function SceneHeader({ section }) {
  const title = text(section?.title);
  const subtitle = text(section?.subtitle);
  if (!title && !subtitle) return null;
  return (
    <header className="scene-head">
      {title && <h1 id="scene-title" className="scene-title">{title}</h1>}
      {subtitle && <p className="scene-subtitle">{subtitle}</p>}
    </header>
  );
}
