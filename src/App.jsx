import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { loveConfig as config } from "./data/loveConfig.js";
import { isOn, text } from "./utils/content.js";
import { useReducedMotion } from "./hooks/useReducedMotion.js";
import FloatingDecorations from "./components/FloatingDecorations.jsx";
import EnvelopeIntro from "./components/EnvelopeIntro.jsx";
import DiaryBook from "./components/DiaryBook.jsx";
import MusicPlayer from "./components/MusicPlayer.jsx";
import Room from "./components/room/Room.jsx";
import SceneFrame from "./components/scenes/SceneFrame.jsx";
import Photobooth from "./components/scenes/Photobooth.jsx";
import PhotoWall from "./components/scenes/PhotoWall.jsx";
import MemoryMatch from "./components/scenes/MemoryMatch.jsx";
import LoveNote from "./components/LoveNote.jsx";
import { ClickHearts } from "./components/Bursts.jsx";
import { Heart } from "./components/Doodles.jsx";

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Applies colours, fonts, page title and motion classes from loveConfig. */
function useTheme(reduced, gentle) {
  useEffect(() => {
    const root = document.documentElement;
    const { colors = {}, fonts = {} } = config.theme || {};
    Object.entries(colors).forEach(([k, v]) => v && root.style.setProperty(`--${kebab(k)}`, v));
    ["handwritten", "body", "typewriter"].forEach((k) => fonts[k] && root.style.setProperty(`--font-${k}`, `"${fonts[k]}"`));
    if (fonts.googleFontsUrl && !document.getElementById("love-fonts")) {
      const link = Object.assign(document.createElement("link"), { id: "love-fonts", rel: "stylesheet", href: fonts.googleFontsUrl });
      document.head.appendChild(link);
    }
    document.title = text(config.site?.title) || "Our Little Love Diary";
    if (colors.background) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors.background);
    root.classList.toggle("heart-cursor", isOn("customCursor"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("motion-off", reduced);
    root.classList.toggle("motion-gentle", gentle);
    // Pause decorative CSS animations while the tab is hidden.
    const onVis = () => root.classList.toggle("is-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reduced, gentle]);
}

// Every place you can go from the room. The URL hash (#diary, #note-1…) keeps the
// phone's back button working.
const notesOn = isOn("notes", config.notes);
const SCENES = {
  diary: { Comp: DiaryBook, on: () => true },
  photobooth: { Comp: Photobooth, on: () => isOn("photobooth", config.photobooth) },
  photoWall: { Comp: PhotoWall, on: () => isOn("photoWall", config.photoWall) },
  memoryMatch: { Comp: MemoryMatch, on: () => isOn("memoryMatch", config.memoryMatch) },
  // note-1, note-2, note-3 … one letter per note in the config
  ...Object.fromEntries(
    (config.notes?.items || []).slice(0, 3).map((note, i) => [
      `note-${i + 1}`,
      {
        Comp: () => (
          <div className="note-scene">
            <LoveNote note={note} />
          </div>
        ),
        on: () => notesOn,
      },
    ])
  ),
};
const roomOn = isOn("room", config.room);
const readView = () => {
  const id = window.location.hash.slice(1);
  return SCENES[id]?.on() ? id : roomOn ? "room" : "diary";
};

export default function App() {
  const { reduced, gentle } = useReducedMotion();
  const hasIntro = isOn("intro", config.intro);
  const [stage, setStage] = useState(hasIntro && !window.location.hash ? "intro" : "site");
  const [view, setView] = useState(readView);
  const [musicCue, setMusicCue] = useState(false);
  const openedFromRoom = useRef(false);
  const enterSite = useCallback(() => setStage("site"), []);
  const footer = isOn("footer", config.footer) ? text(config.footer?.text) : "";
  useTheme(reduced, gentle);

  useEffect(() => {
    const onHash = () => {
      setView(readView());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const open = (id) => {
    openedFromRoom.current = true;
    window.location.hash = id;
  };
  const backToRoom = useCallback(() => {
    if (openedFromRoom.current) {
      openedFromRoom.current = false;
      window.history.back();
    } else {
      window.location.hash = "";
    }
  }, []);

  // Esc inside a scene goes back to the room (the photo viewer handles its own Esc first).
  useEffect(() => {
    if (view === "room" || !roomOn) return;
    const onKey = (e) => e.key === "Escape" && !e.defaultPrevented && backToRoom();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, backToRoom]);

  const Scene = SCENES[view]?.Comp;

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      {isOn("floatingDecorations") && <FloatingDecorations />}
      <main className="app">
        {stage === "intro" ? (
          <EnvelopeIntro onOpen={() => setMusicCue(true)} onDone={enterSite} />
        ) : view === "room" ? (
          <Room onOpen={open} available={Object.keys(SCENES).filter((id) => SCENES[id].on())} />
        ) : (
          <SceneFrame key={view} onBack={roomOn ? backToRoom : null}>
            <Scene hasIntro={hasIntro} />
          </SceneFrame>
        )}
      </main>
      {footer && (
        <footer className="footer">
          {footer} <Heart className="beat" />
        </footer>
      )}
      <MusicPlayer cue={musicCue} />
      {isOn("clickHearts") && <ClickHearts />}
    </MotionConfig>
  );
}
