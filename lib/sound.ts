/**
 * Tiny Web Audio sound engine — no asset files, everything synthesized.
 * Safe on the server: every function no-ops when `window`/AudioContext is absent.
 */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!enabled) return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.08,
  when = 0
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise(duration: number, gain = 0.06, filterFreq = 1200) {
  const ac = getCtx();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = filterFreq;
  const g = ac.createGain();
  const t0 = ac.currentTime;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t0);
}

export function playPurr() {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  const g = ac.createGain();
  const t0 = ac.currentTime;
  osc.type = "sawtooth";
  osc.frequency.value = 42;
  lfo.type = "sine";
  lfo.frequency.value = 26;
  lfoGain.gain.value = 0.035;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.07, t0 + 0.1);
  g.gain.linearRampToValueAtTime(0.0001, t0 + 0.9);
  lfo.connect(lfoGain).connect(g.gain);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  lfo.start(t0);
  osc.stop(t0 + 0.95);
  lfo.stop(t0 + 0.95);
}

export function playHiss() {
  noise(0.35, 0.05, 3000);
}

export function playMeow() {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t0);
  osc.frequency.linearRampToValueAtTime(880, t0 + 0.12);
  osc.frequency.linearRampToValueAtTime(620, t0 + 0.34);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.09, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.45);
}

export function playPop() {
  tone(660, 0.12, "triangle", 0.06);
}

export function playSend() {
  tone(740, 0.09, "triangle", 0.05);
  tone(988, 0.1, "triangle", 0.045, 0.06);
}

export function playMatch() {
  [523, 659, 784, 1046].forEach((f, i) =>
    tone(f, 0.28, "triangle", 0.07, i * 0.09)
  );
}

export function playAchievement() {
  [784, 988, 1318].forEach((f, i) =>
    tone(f, 0.32, "sine", 0.07, i * 0.1)
  );
}
