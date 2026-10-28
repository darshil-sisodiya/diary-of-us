import { ChevronLeft, ChevronRight, House } from "lucide-react";
import { loveConfig as config } from "../data/loveConfig.js";
import { isOn, text } from "../utils/content.js";
import { Heart } from "./Doodles.jsx";

/** Four little hearts that fill in as she reads. Only date pages count as memories. */
export function ProgressHearts({ seq, index }) {
  const nav = config.navigation || {};
  const dates = seq.filter((s) => s.type === "date");
  if (!isOn("progressIndicator") || !dates.length) return null;

  const item = seq[index];
  const reached = seq.slice(0, index + 1).filter((s) => s.type === "date").length;
  const label =
    item.type === "date"
      ? text(nav.progressLabel, { current: item.memory, total: item.total })
      : item.type === "note"
        ? text(nav.noteLabel)
        : text(nav.endingLabel);

  return (
    <div className="progress">
      <ol className="progress-hearts" aria-hidden="true">
        {dates.map((d) => (
          <li key={d.key} className={`${d.memory <= reached ? "is-filled" : ""} ${d === item ? "is-current" : ""}`}>
            <Heart />
          </li>
        ))}
      </ol>
      {label && <p className="progress-label">{label}</p>}
    </div>
  );
}

export default function NavigationControls({ seq, index, onGo }) {
  const nav = config.navigation || {};
  const cover = seq.findIndex((s) => s.type === "cover");
  const prevLabel = text(nav.previous) || "Previous";
  const nextLabel = text(nav.next) || "Next";
  const homeLabel = text(nav.home) || "Cover";
  const isLast = index >= seq.length - 1;

  return (
    <nav className="diary-nav" aria-label="Diary pages">
      <button type="button" className="btn btn-soft nav-prev" onClick={() => onGo(index - 1)} disabled={index === 0}>
        <ChevronLeft aria-hidden="true" />
        <span>{prevLabel}</span>
      </button>

      <div className="nav-middle">
        <ProgressHearts seq={seq} index={index} />
        {cover >= 0 && (
          <button type="button" className="btn btn-ghost nav-home" onClick={() => onGo(cover)}>
            <House aria-hidden="true" />
            <span>{homeLabel}</span>
          </button>
        )}
      </div>

      <button type="button" className="btn btn-primary nav-next" onClick={() => onGo(index + 1)} disabled={isLast}>
        <span>{nextLabel}</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
