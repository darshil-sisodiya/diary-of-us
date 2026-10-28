// A soft paper "swish", synthesised on the fly — no audio file needed.
let ctx;

export function playPageTurn(volume = 0.35) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const dur = 0.38;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) ** 2 * (1 - t * 0.6);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + dur);
    const gain = ctx.createGain();
    gain.gain.value = Math.min(1, Math.max(0, volume));
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    /* sound is a nice-to-have; ignore unsupported browsers */
  }
}
