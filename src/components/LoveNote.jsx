import { motion } from "motion/react";
import { loveConfig as config } from "../data/loveConfig.js";
import { text } from "../utils/content.js";
import { Paperclip, Flower, Heart, Petal } from "./Doodles.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/** A letter on cream stationery. Used for the love letter and for the three notes in the room. */
export default function LoveNote({ note }) {
  const n = note || config.loveNote || {};
  const title = text(n.title);
  const intro = text(n.intro);
  const paragraphs = (n.paragraphs || []).map((p) => text(p)).filter(Boolean);
  const closing = text(n.closing);
  const signature = text(n.signature);
  const ps = text(n.postscript);

  return (
    <article className="letter-page" aria-labelledby={title ? "letter-title" : undefined}>
      <div className="letter-envelope" aria-hidden="true" />
      <motion.div
        className="letter"
        initial={{ opacity: 0, y: 70, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ type: "spring", stiffness: 70, damping: 15, delay: 0.15 }}
      >
        <Paperclip className="letter-clip" />
        <Flower className="letter-deco letter-deco--flower sticker-wiggle" />
        <Heart className="letter-deco letter-deco--heart sticker-wiggle" />
        <Petal className="letter-deco letter-deco--petal" />

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.14, delayChildren: 0.55 } } }}>
          {title && (
            <motion.h2 id="letter-title" className="letter-title" variants={fadeUp}>
              {title}
            </motion.h2>
          )}
          {intro && (
            <motion.p className="letter-greeting" variants={fadeUp}>
              {intro}
            </motion.p>
          )}
          {paragraphs.map((p, i) => (
            <motion.p key={i} className="letter-paragraph" variants={fadeUp}>
              {p}
            </motion.p>
          ))}
          {closing && (
            <motion.p className="letter-closing" variants={fadeUp}>
              {closing}
            </motion.p>
          )}
          {signature && (
            <motion.p className="letter-signature" variants={fadeUp}>
              {signature}
            </motion.p>
          )}
          {ps && (
            <motion.p className="letter-ps" variants={fadeUp}>
              {ps}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </article>
  );
}
