import { useCallback, useEffect, useState } from "react";
import { Delete, CornerDownLeft } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { asset, text } from "../../utils/content.js";
import { score } from "../../utils/wordle.js";
import { Heart } from "../Doodles.jsx";
import { SceneHeader } from "./SceneFrame.jsx";

/* Live co-op wordle: one random word, one shared board, we take turns guessing.
   Synced through Firebase's REST API (EventSource for live updates, fetch for writes).
   Room shape: { answer: <index into answers.txt>, starter: "her" | "you",
                 guesses: [{ w, by }], typing: "cra" } */
const w = config.wordle || {};
const ROOM = `${w.database}/wordle/${w.room}`;
const TRIES = w.tries || 6;
const LEN = 5;
const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const RANK = { miss: 1, near: 2, hit: 3 };
const ME_KEY = "wordle-me";

const put = (path, value) =>
  fetch(path ? `${ROOM}/${path}.json` : `${ROOM}.json`, { method: "PUT", body: JSON.stringify(value) }).then((r) => {
    if (!r.ok) throw new Error(r.status);
  });

function useRoom() {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(false);
  const load = useCallback(
    () =>
      fetch(`${ROOM}.json`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setRoom(d || {});
          setError(false);
        })
        .catch(() => setError(true)),
    []
  );
  useEffect(() => {
    load();
    const es = new EventSource(`${ROOM}.json`);
    es.addEventListener("put", load);
    es.addEventListener("patch", load);
    return () => es.close();
  }, [load]);
  return { room, setRoom, error, setError };
}

/** answers = possible secret words; valid = every word allowed as a guess. */
function useWords() {
  const [words, setWords] = useState(null);
  useEffect(() => {
    const get = (f) => fetch(asset(`/words/${f}`)).then((r) => r.text()).then((t) => t.split(/\s+/).filter(Boolean));
    Promise.all([get("answers.txt"), get("allowed.txt")])
      .then(([answers, allowed]) => setWords({ answers, valid: new Set([...answers, ...allowed]) }))
      .catch(() => setWords({ answers: [], valid: new Set() }));
  }, []);
  return words;
}

function readMe() {
  try {
    return localStorage.getItem(ME_KEY);
  } catch {
    return null;
  }
}

export default function Wordle() {
  const names = { her: text(w.herName) || "her", you: text(w.yourName) || "you" };
  const { room, setRoom, error, setError } = useRoom();
  const words = useWords();
  const [me, setMe] = useState(readMe);
  const [typing, setTyping] = useState("");
  const [bad, setBad] = useState(""); // why the last enter was refused
  const other = me === "her" ? "you" : "her";

  const answer = words?.answers[room?.answer] || "";
  const guesses = Object.values(room?.guesses || {}).filter((g) => typeof g?.w === "string"); // Firebase may hand arrays back as objects; skip anything malformed
  const won = guesses.some((g) => g.w === answer);
  const over = !!answer && (won || guesses.length >= TRIES);
  const starter = room?.starter || "her";
  const turn = guesses.length % 2 === 0 ? starter : starter === "her" ? "you" : "her";
  const myTurn = !!answer && !over && turn === me;
  const shown = myTurn ? typing : room?.typing || ""; // watch the other one type, live

  const send = (path, value) => put(path, value).catch(() => setError(true));

  const newGame = () => {
    const next = { answer: Math.floor(Math.random() * words.answers.length), starter: room?.answer == null ? "her" : starter === "her" ? "you" : "her" };
    setRoom(next);
    setTyping("");
    send("", next);
  };

  const press = useCallback(
    (k) => {
      if (!myTurn) return;
      let next = typing;
      if (k === "enter") {
        const why = typing.length !== LEN ? "not enough letters" : !words.valid.has(typing) ? "not in our word list" : "";
        if (why) {
          setBad(why);
          setTimeout(() => setBad(""), 1400);
          return;
        }
        const g = { w: typing, by: me };
        setRoom((r) => ({ ...r, guesses: [...guesses, g], typing: "" }));
        send(`guesses/${guesses.length}`, g);
        next = "";
      } else if (k === "back") next = typing.slice(0, -1);
      else if (typing.length < LEN) next = typing + k;
      if (next !== typing || k === "enter") {
        setTyping(next);
        send("typing", next);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myTurn, typing, words, guesses, me]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key === "Enter" ? "enter" : e.key === "Backspace" ? "back" : /^[a-z]$/i.test(e.key) ? e.key.toLowerCase() : null;
      if (!k) return;
      e.preventDefault(); // otherwise Enter also "clicks" whichever on-screen key was tapped last
      press(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const choose = (who) => {
    try {
      localStorage.setItem(ME_KEY, who);
    } catch {
      /* private mode: she'll just pick again next time */
    }
    setMe(who);
  };

  const keyState = {};
  guesses.forEach(({ w: g }) =>
    score(g, answer).forEach((m, i) => {
      if ((RANK[m] || 0) > (RANK[keyState[g[i]]] || 0)) keyState[g[i]] = m;
    })
  );

  const status = !answer
    ? ""
    : won
      ? `${guesses.at(-1).by === me ? "you" : names[other]} got it in ${guesses.length}! ♡`
      : over
        ? "so close… we'll get the next one"
        : myTurn
          ? "your turn ♡"
          : `${names[other]}'s turn…`;

  return (
    <section className="wordle-scene" aria-labelledby="scene-title">
      <SceneHeader section={w} />
      {error && <p className="wordle-note is-error">can't reach our game right now, check the internet ♡</p>}

      {!me ? (
        <div className="wordle-card wordle-who">
          <p>who's playing?</p>
          <div>
            <button type="button" className="btn btn-primary" onClick={() => choose("her")}>
              {names.her}
            </button>
            <button type="button" className="btn btn-soft" onClick={() => choose("you")}>
              {names.you}
            </button>
          </div>
        </div>
      ) : !room || !words ? (
        !error && <p className="wordle-note">loading our game…</p>
      ) : !answer ? (
        <button type="button" className="btn btn-primary" onClick={newGame}>
          <Heart /> start our first game
        </button>
      ) : (
        <>
          <p className={`wordle-status ${myTurn ? "is-mine" : ""}`} aria-live="polite">
            {status}
          </p>

          <div className="wordle-board" style={{ "--len": LEN }}>
            {Array.from({ length: TRIES }, (_, r) => {
              const g = guesses[r];
              const marks = g ? score(g.w, answer) : [];
              const live = !over && r === guesses.length;
              const letters = g ? g.w : live ? shown : "";
              const by = g ? g.by : live ? turn : null;
              return (
                <div key={r} className={`wordle-row ${live && bad ? "is-bad" : ""}`}>
                  <span className={`wordle-who-tag ${by || ""}`} aria-label={by ? names[by] : undefined}>
                    {by ? names[by][0] : ""}
                  </span>
                  {Array.from({ length: LEN }, (_, c) => (
                    <span key={c} className={`wordle-tile ${marks[c] || (letters[c] ? "is-typed" : "")}`} style={{ "--c": c }}>
                      {letters[c] || ""}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {bad && <p className="wordle-note is-error">{bad}</p>}
          {over && (
            <p className="wordle-note">
              the word was <strong>{answer}</strong>
            </p>
          )}

          {over ? (
            <button type="button" className="btn btn-primary" onClick={newGame}>
              <Heart /> new word
            </button>
          ) : (
            <div className={`wordle-keys ${myTurn ? "" : "is-waiting"}`} onPointerDown={(e) => e.preventDefault() /* tapping a key shouldn't leave it focused */}>
              {KEYS.map((row, i) => (
                <div key={row}>
                  {i === 2 && (
                    <button type="button" className="wordle-key is-wide" onClick={() => press("enter")} aria-label="enter" disabled={!myTurn}>
                      <CornerDownLeft aria-hidden="true" />
                    </button>
                  )}
                  {[...row].map((k) => (
                    <button key={k} type="button" className={`wordle-key ${keyState[k] || ""}`} onClick={() => press(k)} disabled={!myTurn}>
                      {k}
                    </button>
                  ))}
                  {i === 2 && (
                    <button type="button" className="wordle-key is-wide" onClick={() => press("back")} aria-label="delete" disabled={!myTurn}>
                      <Delete aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button type="button" className="wordle-switch" onClick={() => choose(other)}>
            not {names[me]}? switch to {names[other]}
          </button>
        </>
      )}
    </section>
  );
}
