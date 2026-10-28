import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loveConfig as config } from "../data/loveConfig.js";
import { isOn, text } from "../utils/content.js";
import { useReducedMotion, useTypewriter } from "../hooks/useReducedMotion.js";
import { Bouquet, Heart, Sparkle } from "./Doodles.jsx";
import { HeartBurst } from "./Bursts.jsx";
import { Envelope } from "./EnvelopeIntro.jsx";

/** The secret envelope: opens, hearts float out, the message types itself. */
function SecretEnvelope({ message }) {
  const e = config.ending;
  const { reduced } = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const noteRef = useRef(null);
  const typed = useTypewriter(message, showNote, reduced);
  const prompt = text(e.revealPrompt);
  const button = text(e.revealButtonText) || "Open";
  const signature = text(e.revealSignature);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setShowNote(true), reduced ? 0 : 900);
    return () => clearTimeout(t);
  }, [open, reduced]);

  useEffect(() => {
    if (showNote) noteRef.current?.focus({ preventScroll: true });
  }, [showNote]);

  return (
    <div className="surprise">
      <div className="surprise-envelope">
        <Envelope size="sm" open={open} onClick={() => setOpen(true)} letter={<Heart className="env-letter-heart beat" />} />
        {open && <HeartBurst count={14} spread={170} rise={110} />}
      </div>
      {prompt && !open && <p className="surprise-prompt">{prompt}</p>}
      {!open && (
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          {button}
          <Heart className="btn-heart beat" />
        </button>
      )}
      <AnimatePresence>
        {showNote && (
          <motion.div
            ref={noteRef}
            tabIndex={-1}
            className="secret-note"
            initial={{ opacity: 0, y: 24, scale: 0.94, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -0.6 }}
            transition={{ type: "spring", stiffness: 110, damping: 15 }}
          >
            <span className="photo-tape" aria-hidden="true" />
            <p className="sr-only">{message}</p>
            <p className="secret-text" aria-hidden="true">
              {typed}
              {typed.length < message.length && <span className="caret" />}
            </p>
            {signature && typed.length === message.length && (
              <motion.p className="secret-signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {signature}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The last page of the diary. */
export default function FinalSurprise({ onRestart, onMemories, restartLabel, memoriesLabel }) {
  const e = config.ending || {};
  const kicker = text(e.kicker);
  const heading = text(e.heading);
  const message = text(e.message);
  const secret = isOn("finalSurprise") && e.revealEnabled !== false ? text(e.revealMessage) : "";

  return (
    <article className="ending-page" aria-labelledby={heading ? "ending-title" : undefined}>
      <div className="ending-glow" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Sparkle key={i} className={`ending-sparkle ending-sparkle--${i} twinkle`} />
        ))}
      </div>
      <Bouquet className="ending-bouquet" />
      {kicker && <p className="page-kicker">{kicker}</p>}
      {heading && (
        <h2 id="ending-title" className="ending-title">
          {heading}
        </h2>
      )}
      {message && <p className="ending-message">{message}</p>}
      {secret && <SecretEnvelope message={secret} />}
      <div className="ending-actions">
        {restartLabel && (
          <button type="button" className="btn btn-soft" onClick={onRestart}>
            {restartLabel}
          </button>
        )}
        {memoriesLabel && (
          <button type="button" className="link-btn" onClick={onMemories}>
            {memoriesLabel}
          </button>
        )}
      </div>
    </article>
  );
}
