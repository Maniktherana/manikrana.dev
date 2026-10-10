import { voiceNote } from "@/work/voice-edge/voice-note";

const noteFrames = Uint8Array.from(atob(voiceNote.frames), (char) => char.charCodeAt(0));
const FRAME_COUNT = noteFrames.length / voiceNote.bins;
export const NOTE_MS = (FRAME_COUNT / voiceNote.fps) * 1000;

const SPOKEN_FRAMES = Math.ceil(voiceNote.words.at(-1)!.end * voiceNote.fps) + 4;

const FALL_PER_FRAME = ((-20 * Math.log10(0.8)) / 70) * 255;

function frameAt(index: number) {
  return noteFrames.subarray(index * voiceNote.bins, (index + 1) * voiceNote.bins);
}

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
