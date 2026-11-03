import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { asset, hasContent, text } from "../../utils/content.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { Heart, Sparkle, Star } from "../Doodles.jsx";
import { SceneHeader } from "./SceneFrame.jsx";

// Paint colours from our palette that day.
const PAINT = ["#f6cf3f", "#5e9fe0", "#cf7fd6", "#f2915a", "#ffffff"];
const blob = "M50 8c14 0 18 12 30 14s14 18 6 28 4 24-10 30-22-2-34 4S16 82 12 68 0 50 10 38 36 8 50 8z";

/** A little splash of paint: a blob plus a couple of drips. */
const Splat = ({ c, className }) => (
  <svg viewBox="0 0 100 100" className={`studio-splat ${className}`} aria-hidden="true">
    <path d={blob} fill={c} />
    <circle cx="92" cy="20" r="5" fill={c} />
    <circle cx="10" cy="88" r="3.5" fill={c} />
  </svg>
);

function Palette() {
  return (
    <svg viewBox="0 0 220 150" className="studio-palette" aria-hidden="true">
      <path d="M110 8C52 8 8 42 8 82s38 60 84 60c22 0 22-18 10-28s-4-26 18-24c50 4 92-6 92-34S168 8 110 8z" fill="#f3d9b5" stroke="#d4a985" strokeWidth="3" />
      <ellipse cx="118" cy="106" rx="13" ry="10" fill="var(--background)" stroke="#d4a985" strokeWidth="3" />
      {PAINT.map((c, i) => (
        <ellipse key={c} cx={44 + i * 30 + (i % 2) * 6} cy={i % 2 ? 66 : 46} rx="13" ry="11" fill={c} stroke="rgb(90 56 51 / 0.12)" />
      ))}
      <g transform="rotate(-28 150 120)">
        <rect x="70" y="116" width="120" height="7" rx="3.5" fill="#9c5560" />
        <rect x="182" y="114" width="16" height="11" rx="2" fill="#c9c3c7" />
        <path d="M198 113c14 2 18 6 18 6s-4 4-18 6z" fill="#5e9fe0" />
      </g>
    </svg>
  );
}

export default function ArtStudio() {
  const s = config.artStudio || {};
  const { reduced } = useReducedMotion();
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState({});
  const gone = (k) => () => setMissing((m) => ({ ...m, [k]: true }));
  const hasVideo = hasContent(s.video) && !missing.video;
  const hasPhoto = hasContent(s.photo) && !missing.photo;

  // Autoplay (muted, looping) unless she's asked for less motion.
  useEffect(() => {
    if (!reduced) video.current?.play().catch(() => {});
  }, [reduced]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  };

  return (
    <section className="studio-scene" aria-labelledby="scene-title">
      <SceneHeader section={s} />

      <div className="studio-wall">
        <Splat c={PAINT[0]} className="splat-1" />
        <Splat c={PAINT[1]} className="splat-2" />
        <Splat c={PAINT[2]} className="splat-3" />
        <Splat c={PAINT[3]} className="splat-4" />
        <Star className="studio-doodle doodle-1" />
        <Sparkle className="studio-doodle doodle-2" />
        <Heart className="studio-doodle doodle-3" />
        <Star className="studio-doodle doodle-4" />

        {hasVideo && (
          <figure className="studio-piece studio-piece--canvas">
            <span className="studio-hang" aria-hidden="true" />
            <div className="studio-canvas">
              <video
                ref={video}
                src={asset(s.video)}
                muted
                loop
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={gone("video")}
                onClick={toggle}
                aria-label={text(s.videoTitle) || "timelapse of us painting"}
              />
              <button type="button" className={`studio-play ${playing ? "is-playing" : ""}`} onClick={toggle}>
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                <span>{playing ? text(s.pauseText) || "pause" : text(s.playText) || "play"}</span>
              </button>
            </div>
            <figcaption className="studio-placard">
              {text(s.videoTitle) && <strong>{text(s.videoTitle)}</strong>}
              {text(s.videoNote) && <span>{text(s.videoNote)}</span>}
            </figcaption>
          </figure>
        )}

        {hasPhoto && (
          <figure className="studio-piece studio-piece--portrait">
            <span className="studio-hang" aria-hidden="true" />
            <div className="studio-frame">
              <img src={asset(s.photo)} alt={text(s.photoNote) || text(s.photoTitle) || "what we painted"} onError={gone("photo")} />
            </div>
            <figcaption className="studio-placard">
              {text(s.photoTitle) && <strong>{text(s.photoTitle)}</strong>}
              {text(s.photoNote) && <span>{text(s.photoNote)}</span>}
            </figcaption>
          </figure>
        )}

        <Palette />
      </div>
    </section>
  );
}
