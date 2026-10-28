import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";
import { loveConfig as config } from "../data/loveConfig.js";
import { asset, hasContent, isOn, text } from "../utils/content.js";

/** Small play/pause button. Never autoplays; hides itself if the song file is missing. */
export default function MusicPlayer({ cue }) {
  const m = config.music || {};
  const nav = config.navigation || {};
  const src = isOn("musicPlayer", m) && hasContent(m.src) ? asset(m.src.trim()) : "";
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  const title = text(m.title);

  const play = () => {
    const a = audio.current;
    if (!a) return;
    a.volume = Math.min(1, Math.max(0, m.volume ?? 0.5));
    a.play().catch(() => setPlaying(false));
  };

  // `cue` flips to true when she opens the envelope (a real click, so browsers allow it).
  useEffect(() => {
    if (cue && m.startWithDiary) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue]);

  if (!src || broken) return null;

  return (
    <div className={`music ${playing ? "is-playing" : ""}`}>
      <audio
        ref={audio}
        src={src}
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setBroken(true)}
      />
      <button
        type="button"
        className="music-btn"
        onClick={() => (audio.current?.paused ? play() : audio.current.pause())}
        aria-pressed={playing}
        aria-label={playing ? nav.pauseMusic || "Pause music" : nav.playMusic || "Play music"}
      >
        {playing ? <Pause aria-hidden="true" /> : <Music aria-hidden="true" />}
      </button>
      {title && (
        <span className="music-title">
          {playing && (
            <span className="music-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
          {title}
        </span>
      )}
    </div>
  );
}
