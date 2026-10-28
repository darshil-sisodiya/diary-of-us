import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { loveConfig as config } from "../data/loveConfig.js";
import { text } from "../utils/content.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { Heart, Flower, Sparkle } from "./Doodles.jsx";
import { HeartBurst } from "./Bursts.jsx";

/** CSS-drawn envelope. `open` lifts the flap and slides the letter out. */
export function Envelope({ open, label, letter, size = "lg", onClick }) {
  return (
    <div className={`envelope envelope--${size} ${open ? "is-open" : ""}`} onClick={onClick} aria-hidden="true">
      <div className="env-back" />
      <div className="env-letter">{letter}</div>
      <div className="env-front">{label && <span className="env-label">{label}</span>}</div>
      <div className="env-flap" />
      <span className="env-seal">
        <Heart />
      </span>
    </div>
  );
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

export default function EnvelopeIntro({ onOpen, onDone }) {
  const { reduced } = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = config.intro || {};
  const kicker = text(c.kicker);
  const heading = text(c.heading);
  const message = text(c.message);
  const label = text(c.envelopeLabel);
  const letter = text(c.letterText);
  const button = text(c.buttonText) || "Open";
  const skip = text(c.skipText);

  useEffect(() => {
    if (!open) return;
    // Let the letter rise, then fade the whole screen out and hand over to the diary.
    const t = setTimeout(() => setLeaving(true), reduced ? 150 : 1500);
    return () => clearTimeout(t);
  }, [open, reduced, onDone]);

  const handleOpen = () => {
    if (open) return;
    setOpen(true);
    onOpen?.();
  };

  return (
    <motion.section
      className="intro"
      aria-labelledby="intro-heading"
      initial="hidden"
      animate={leaving ? "leave" : "show"}
      onAnimationComplete={(v) => v === "leave" && onDone()}
      variants={{
        show: { transition: { staggerChildren: 0.12 } },
        leave: { opacity: 0, scale: 0.97, transition: { duration: 0.4 } },
      }}
    >
      <div className="intro-text">
        {kicker && (
          <motion.p className="intro-kicker" variants={rise}>
            {kicker}
          </motion.p>
        )}
        {heading && (
          <motion.h1 id="intro-heading" className="intro-heading" variants={rise}>
            {heading}
          </motion.h1>
        )}
        {message && (
          <motion.p className="intro-message" variants={rise}>
            {message}
          </motion.p>
        )}
      </div>

      <motion.div className="intro-envelope" variants={rise}>
        <Flower className="intro-deco intro-deco--a sticker-wiggle" />
        <Sparkle className="intro-deco intro-deco--b twinkle" />
        <Heart className="intro-deco intro-deco--c sticker-wiggle" />
        <Envelope
          open={open}
          label={label}
          onClick={handleOpen}
          letter={
            <>
              <Heart className="env-letter-heart" />
              {letter && <span className="env-letter-text">{letter}</span>}
            </>
          }
        />
        {open && <HeartBurst count={12} spread={160} rise={130} />}
      </motion.div>

      <motion.div className="intro-actions" variants={rise}>
        <button type="button" className="btn btn-primary btn-lg" onClick={handleOpen} disabled={open}>
          {button}
          <Heart className="btn-heart beat" />
        </button>
        {skip && (
          <button type="button" className="link-btn" onClick={onDone}>
            {skip}
          </button>
        )}
      </motion.div>
    </motion.section>
  );
}
