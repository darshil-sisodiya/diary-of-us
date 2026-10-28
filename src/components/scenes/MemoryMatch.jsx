import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { allPhotos, text } from "../../utils/content.js";
import { useLoadedPhotos } from "../../hooks/useReducedMotion.js";
import { Heart } from "../Doodles.jsx";
import { HeartBurst } from "../Bursts.jsx";
import { SceneHeader } from "./SceneFrame.jsx";

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

// Up to 8 pairs, spread across the dates (first photo of each date, then the second…).
function pickPairs(photos) {
  const slot = (p) => Number(String(p.key).split("-").pop()) || 0;
  return [...photos].sort((a, b) => slot(a) - slot(b)).slice(0, 8);
}

const newDeck = (pairs) =>
  shuffle(pairs.flatMap((p) => [{ id: `${p.key}-a`, pair: p.key, photo: p }, { id: `${p.key}-b`, pair: p.key, photo: p }]));

export default function MemoryMatch() {
  const g = config.memoryMatch || {};
  const { ready, photos } = useLoadedPhotos(useMemo(allPhotos, []));
  const pairs = useMemo(() => pickPairs(photos), [photos]);
  const [deck, setDeck] = useState([]);
  const [open, setOpen] = useState([]); // indexes currently face-up (max 2)
  const [found, setFound] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [justMatched, setJustMatched] = useState(null);
  const lock = useRef(false);

  const restart = () => {
    setDeck(newDeck(pairs));
    setOpen([]);
    setFound(new Set());
    setMoves(0);
    lock.current = false;
  };
  useEffect(restart, [pairs]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i) => {
    const card = deck[i];
    if (lock.current || open.includes(i) || found.has(card.pair)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((n) => deck[n]);
    if (a.pair === b.pair) {
      setFound((f) => new Set(f).add(a.pair));
      setJustMatched(a.pair);
      setOpen([]);
    } else {
      lock.current = true;
      setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 900);
    }
  };

  const won = pairs.length > 0 && found.size === pairs.length;
  const cols = deck.length >= 8 ? 4 : deck.length > 4 ? 3 : 2;

  return (
    <section className="match-scene" aria-labelledby="scene-title">
      <SceneHeader section={g} />

      {ready && pairs.length < 2 ? (
        text(g.notEnoughPhotos) && <p className="match-empty">{text(g.notEnoughPhotos)}</p>
      ) : (
        <>
          <div className="match-stats" aria-live="polite">
            <span>
              {text(g.movesLabel) || "moves"} <b>{moves}</b>
            </span>
            <span>
              {text(g.pairsLabel) || "pairs"} <b>{found.size}</b> / {pairs.length}
            </span>
            <button type="button" className="btn btn-ghost" onClick={restart} aria-label="restart the game">
              <RotateCcw aria-hidden="true" />
            </button>
          </div>

          <div className="match-board">
            <div className="match-grid" style={{ "--cols": cols }}>
              {deck.map((card, i) => {
                const up = open.includes(i) || found.has(card.pair);
                const done = found.has(card.pair);
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`match-card ${up ? "is-up" : ""} ${done ? "is-done" : ""}`}
                    onClick={() => flip(i)}
                    aria-label={up ? card.photo.alt : `card ${i + 1}, face down`}
                    disabled={done}
                    style={{ "--i": i }}
                  >
                    <span className="match-inner">
                      <span className="match-back">
                        <Heart />
                      </span>
                      <span className="match-front">
                        <img src={card.photo.src} alt="" draggable="false" style={{ objectPosition: card.photo.focus || "center" }} />
                        {done && justMatched === card.pair && <HeartBurst count={5} spread={50} rise={30} />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {won && (
              <motion.div
                className="match-win"
                role="status"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 14 }}
              >
                <HeartBurst count={14} spread={180} rise={80} />
                {text(g.winTitle) && <h2 className="match-win-title">{text(g.winTitle)}</h2>}
                {text(g.winMessage, { moves }) && <p>{text(g.winMessage, { moves })}</p>}
                <button type="button" className="btn btn-primary" onClick={restart}>
                  {text(g.playAgainText) || "play again"}
                </button>
              </motion.div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
