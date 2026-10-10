import { voiceNote } from "@/work/voice-edge/voice-note";

// The note's analyser frames, decoded once, and how long the note plays.
const noteFrames = Uint8Array.from(atob(voiceNote.frames), (char) => char.charCodeAt(0));
const FRAME_COUNT = noteFrames.length / voiceNote.bins;
export const NOTE_MS = (FRAME_COUNT / voiceNote.fps) * 1000;

// The recording runs on past the last word with the room's own hiss. Only the
// spoken part is served, so the listeners sit still whenever nobody is talking.
const SPOKEN_FRAMES = Math.ceil(voiceNote.words.at(-1)!.end * voiceNote.fps) + 4;

// When its input goes quiet, an analyser with a smoothing of 0.8 keeps 0.8 of
// each level every frame. That is a fall of about 1.9 dB a frame, or 7 of the
// 255 steps across the note's -100 to -30 dB, so after the last word every bin
// drops away over a few frames instead of cutting out.
const FALL_PER_FRAME = ((-20 * Math.log10(0.8)) / 70) * 255;

function frameAt(index: number) {
  return noteFrames.subarray(index * voiceNote.bins, (index + 1) * voiceNote.bins);
}

// Plays the voice note the way a microphone would hear it: a stand-in for an
// AnalyserNode that serves the recorded frame for the time since `startsAt`,
// silence before it, and the analyser's own fall to silence after it. Anything
// that reads a microphone through an analyser (the voice edge, the thinking
// orb) runs its own audio path on it.
export function noteAnalyser(startsAt: number) {
  const lastSpoken = frameAt(SPOKEN_FRAMES - 1);

  return {
    frequencyBinCount: voiceNote.bins,
    getByteFrequencyData(array: Uint8Array) {
      const frame = Math.floor(((performance.now() - startsAt) / 1000) * voiceNote.fps);

      if (frame < 0) {
        array.fill(0);
      } else if (frame < SPOKEN_FRAMES) {
        array.set(frameAt(frame));
      } else {
        const fall = (frame - SPOKEN_FRAMES + 1) * FALL_PER_FRAME;
        lastSpoken.forEach((level, bin) => {
          array[bin] = Math.max(0, level - fall);
        });
      }
    },
  };
}
