/** Wordle colours for one guess: "hit" (right spot), "near" (in the word), "miss". Handles repeated letters. */
export function score(guess, answer) {
  const res = Array(guess.length).fill("miss");
  const left = {};
  [...answer].forEach((c, i) => {
    if (guess[i] === c) res[i] = "hit";
    else left[c] = (left[c] || 0) + 1;
  });
  [...guess].forEach((c, i) => {
    if (res[i] !== "hit" && left[c]) {
      res[i] = "near";
      left[c]--;
    }
  });
  return res;
}
