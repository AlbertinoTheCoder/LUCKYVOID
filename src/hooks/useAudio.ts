import { useEffect, useRef } from "react";
import type { Settings } from "../types";

// Sound starts on a gesture so browsers can unlock their audio context.
export function useAudio(settings: Settings) {
  const ctx = useRef<AudioContext | null>(null);
  const currentSettings = useRef(settings);
  currentSettings.current = settings;
  const get = () => {
    if (!ctx.current || ctx.current.state === "closed")
      ctx.current = new AudioContext();
    if (ctx.current.state === "suspended")
      void ctx.current.resume().catch(() => {});
    return ctx.current;
  };
  const play = (kind = "click") => {
    if (kind === "unlock") {
      get();
      return;
    }
    if (!currentSettings.current.sound) return;
    const c = get();
    const frequencies =
      kind === "win"
        ? [659.25, 830.61, 987.77]
        : kind === "achievement"
          ? [783.99, 987.77, 1174.66, 1567.98]
          : [kind === "spin" ? 220 : kind === "card" ? 440 : 520];
    frequencies.forEach((frequency, i) => {
      const o = c.createOscillator(),
        g = c.createGain(),
        start = c.currentTime + i * 0.075;
      o.type = kind === "spin" ? "triangle" : "sine";
      o.frequency.value = frequency;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.045, start + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      o.connect(g);
      g.connect(c.destination);
      o.start(start);
      o.stop(start + 0.16);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let bus: GainNode | undefined,
      compressor: DynamicsCompressorNode | undefined;
    let step = 0;
    const start = () => {
      if (!currentSettings.current.music && !currentSettings.current.sound)
        return;
      const c = get();
      if (!currentSettings.current.music || timer || document.hidden) return;
      bus = c.createGain();
      bus.gain.value = 0.16;
      compressor = c.createDynamicsCompressor();
      compressor.threshold.value = -20;
      bus.connect(compressor);
      compressor.connect(c.destination);
      const output = bus;
      const noise = c.createBuffer(
        1,
        Math.floor(c.sampleRate * 0.16),
        c.sampleRate,
      );
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const note = (
        frequency: number,
        duration: number,
        volume: number,
        type: OscillatorType,
        time: number,
        endFrequency = frequency,
      ) => {
        const o = c.createOscillator(),
          g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(frequency, time);
        o.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(volume, time + 0.004);
        g.gain.exponentialRampToValueAtTime(0.001, time + duration);
        o.connect(g);
        g.connect(output);
        o.start(time);
        o.stop(time + duration + 0.02);
        o.onended = () => {
          o.disconnect();
          g.disconnect();
        };
      };
      const hat = (time: number, accent: boolean) => {
        const source = c.createBufferSource(),
          filter = c.createBiquadFilter(),
          g = c.createGain();
        source.buffer = noise;
        filter.type = "highpass";
        filter.frequency.value = accent ? 1700 : 6500;
        g.gain.setValueAtTime(accent ? 0.24 : 0.09, time);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          time + (accent ? 0.12 : 0.035),
        );
        source.connect(filter);
        filter.connect(g);
        g.connect(output);
        source.start(time);
        source.stop(time + 0.15);
        source.onended = () => {
          source.disconnect();
          filter.disconnect();
          g.disconnect();
        };
      };
      const tick = () => {
        const time = c.currentTime + 0.025,
          beat = step % 16;
        // Four quarter-note kicks per bar anchor the chaotic arcade fills in 4/4.
        const root = [65.41, 77.78, 58.27, 87.31][Math.floor(step / 32) % 4];
        const scale = [0, 3, 7, 10, 12, 15, 19];
        if (beat % 4 === 0) note(145, 0.14, 0.65, "sine", time, 38);
        if (beat % 8 === 4 || beat === 14) hat(time, true);
        hat(time, false);
        if (beat % 2 === 0 || Math.random() < 0.3)
          note(
            root * (beat === 6 || beat === 14 ? 2 : 1),
            0.12,
            0.18,
            "triangle",
            time,
          );
        const pitch =
          scale[(step * 3 + Math.floor(Math.random() * 3)) % scale.length];
        note(
          root * 4 * 2 ** (pitch / 12),
          0.055,
          0.065,
          beat % 3 === 0 ? "square" : "sawtooth",
          time,
        );
        if (beat >= 12 && Math.random() < 0.5)
          note(root * 8, 0.04, 0.045, "square", time + 0.055, root * 3);
        step++;
      };
      tick();
      timer = setInterval(tick, 60000 / 138 / 4);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
      if (bus && ctx.current && ctx.current.state !== "closed")
        bus.gain.setValueAtTime(0, ctx.current.currentTime);
      bus?.disconnect();
      compressor?.disconnect();
      bus = undefined;
      compressor = undefined;
    };
    const visibility = () => {
      if (document.hidden) stop();
      else if (ctx.current?.state === "running") start();
    };
    window.addEventListener("pointerdown", start, { capture: true });
    window.addEventListener("keydown", start, { capture: true });
    document.addEventListener("visibilitychange", visibility);
    if (ctx.current?.state === "running") start();
    return () => {
      stop();
      window.removeEventListener("pointerdown", start, { capture: true });
      window.removeEventListener("keydown", start, { capture: true });
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [settings.music, settings.sound]);
  useEffect(
    () => () => {
      void ctx.current?.close().catch(() => {});
    },
    [],
  );
  return play;
}
