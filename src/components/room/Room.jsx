import { motion } from "motion/react";
import { BookHeart, Camera, Grid3x3, Images, Mail, Palette, Sparkles } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { isOn, text } from "../../utils/content.js";
import RoomScene from "./RoomScene.jsx";

function timeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return "morning";
  if (h >= 9 && h < 17) return "day";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

const ICONS = { diary: BookHeart, photobooth: Camera, photoWall: Images, memoryMatch: Sparkles, artStudio: Palette, wordle: Grid3x3 };

export default function Room({ onOpen, available }) {
  const r = config.room || {};
  const labels = Object.fromEntries(Object.entries(r.labels || {}).map(([k, v]) => [k, text(v)]));
  const sky = r.showRealSky === false ? "day" : timeOfDay();
  const kicker = text(r.kicker);
  const heading = text(r.heading);
  const hint = text(r.hint);
  const notes = (config.notes?.items || [])
    .slice(0, 3)
    .map((n, i) => ({ id: `note-${i + 1}`, label: text(n.label) || `note ${i + 1}`, seal: n.seal }))
    .filter((n) => available.includes(n.id));

  // Quick buttons under the room (mainly for phones, where the room is small).
  const shortcuts = [
    ...["diary", "photobooth", "photoWall", "memoryMatch", "artStudio", "wordle"]
      .filter((id) => available.includes(id))
      .map((id) => ({ id, label: labels[id] || id, Icon: ICONS[id] })),
    ...notes.map((n) => ({ id: n.id, label: n.label, Icon: Mail })),
  ];

  return (
    <motion.section
      className="room-page"
      aria-label={heading || "our room"}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
    >
      <header className="room-head">
        {kicker && <p className="room-kicker">{kicker}</p>}
        {heading && <h1 className="room-title">{heading}</h1>}
        {hint && <p className="room-hint">{hint}</p>}
      </header>

      <RoomScene
        sky={sky}
        available={available}
        labels={labels}
        notes={notes}
        notesHeading={text(config.notes?.heading)}
        onOpen={onOpen}
        catOn={isOn("roomCat")}
        catSays={text(r.catSays)}
      />

      <nav className="room-shortcuts" aria-label="places in the room">
        {shortcuts.map(({ id, label, Icon }) => (
          <button key={id} type="button" className="room-chip" onClick={() => onOpen(id)}>
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </motion.section>
  );
}
