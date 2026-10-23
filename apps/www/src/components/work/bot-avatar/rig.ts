import { Blink } from "./blink";
import type { BotChoreography, BotState } from "./choreography";
import { curveLength, sampleClip, sampleCurve } from "./curves";
import { atomRibbons, Confetti, doneFrame, tumbleHeading, type Tumble } from "./done";
import { Mood, type BotExpression } from "./expression";
import { Eyes } from "./eyes";
import { Gaze, type BotPointer } from "./gaze";
import { Head } from "./head";
import { clamp, fixed, lerp, TAU, turns } from "./math";
import { Ribbons } from "./ribbons";
import type { BotShape } from "./shapes";
import { Tokens } from "./tokens";
import type { BotPose, BotTuning } from "./tuning";
import { comets, sweepAt } from "./working";

export type BotLook = {
  state: BotState;
  shape: BotShape;
  expression: BotExpression;
  tuning: BotTuning;
  choreography: BotChoreography;
};

type Tween = { from: number; to: number; t0: number };
type Snapshot = { dots: number; bang: number; rib: number; pose: BotPose; hop: number };

const POSE_KEYS: (keyof BotPose)[] = [
  "tilt",
  "sway",
  "swayPeriod",
  "breath",
  "breathPeriod",
  "leanX",
  "leanY",
  "lid",
  "eyeScale",
  "roll",
];
const LID_KEYS = new Set<keyof BotPose>(["lid", "eyeScale", "roll"]);

const eyed = (state: BotState) => state !== "blocked" && state !== "thinking";
const part = <T extends Element>(svg: SVGSVGElement, name: string) =>
  svg.querySelector(`[data-part="${name}"]`) as T;
const pair = <T extends Element>(svg: SVGSVGElement, name: string) =>
  [...svg.querySelectorAll(`[data-part="${name}"]`)] as [T, T];

export class BotRig {
  private readonly body: SVGGElement;
  private readonly head: SVGGElement;
  private readonly outline: Head;
  private readonly tokens: Tokens;
  private readonly eyes: Eyes;
  private readonly ribbons: Ribbons;
  private readonly confetti: Confetti;
  private readonly gaze = new Gaze();
  private readonly blink = new Blink();
  private readonly mood = new Mood();
  private state: BotState;
  private tuning: BotTuning;
  private choreography: BotChoreography;
  private calm = false;
  private last = 0;
  private start = 0;
  private from: Snapshot;
  private current: Snapshot;
  private flip: Tween;
  private flipDir = Math.random() < 0.5 ? 1 : -1;
  private faceBack: boolean;
  private turn: Tween | null = null;
  private carry = 0;
  private ambient = 0;
  private tumble: Tumble = { spin: 0, tip: 0 };
  private tumbleCarry: Tumble = { spin: 0, tip: 0 };
  private swayPhase = Math.random() * TAU;
  private breathPhase = Math.random() * TAU;
  private workStart = 0;
  private workEnd = Infinity;

  constructor(svg: SVGSVGElement, start: Omit<BotLook, "expression">) {
    this.body = part(svg, "body");
    this.head = part(svg, "head");
    this.outline = new Head(part(svg, "outline"), part(svg, "clip"), start.shape);
    this.tokens = new Tokens(pair(svg, "dot"), part(svg, "stem"));
    this.eyes = new Eyes(pair(svg, "eye"), pair(svg, "smile"));
    this.ribbons = new Ribbons(part(svg, "back"), part(svg, "front"));
    this.confetti = new Confetti(part(svg, "fx"));
    this.state = start.state;
    this.tuning = start.tuning;
    this.choreography = start.choreography;
    this.faceBack = !eyed(this.state);
    this.from = { ...this.targets(this.state), pose: { ...this.tuning.poses[this.state] }, hop: 0 };
    this.current = { ...this.from, pose: { ...this.from.pose } };
    const face = this.faceBack ? Math.PI * this.flipDir : 0;
    this.flip = { from: face, to: face, t0: 0 };
  }

  update(look: BotLook, now = performance.now()) {
    this.tuning = look.tuning;
    this.choreography = look.choreography;
    this.mood.set(look.expression, now, this.calm);
    this.outline.setShape(look.shape, now);
    this.enter(look.state, now);
  }

  setCalm(calm: boolean) {
    this.calm = calm;
  }

  setPointer(pointer: BotPointer | null) {
    this.gaze.pointer = pointer;
  }

  // Moves the current entrance to a given point in time, so an external playhead can scrub it.
  seek(seconds: number, now = performance.now()) {
    this.start = now - seconds * 1000;
    this.flip.t0 = this.start;
  }

  spin(now = performance.now()) {
    if (this.calm) return;
    const angle = this.turnAngle(now);
    const to = this.turn ? this.turn.to + TAU * Math.sign(this.turn.to || 1) : TAU * this.flipDir;
    this.turn = { from: angle, to, t0: now };
  }

  destroy() {
    this.ribbons.destroy();
    this.confetti.destroy();
  }

  private enter(state: BotState, now: number) {
    if (state === this.state) return;
    const flipNow = this.flipAngle(now);
    let flipTo = flipNow;
    if (!eyed(state) && eyed(this.state) && !this.faceBack) {
      this.faceBack = true;
      flipTo = flipNow + Math.PI * this.flipDir;
    } else if (eyed(state) && this.faceBack) {
      this.faceBack = false;
      flipTo = flipNow + Math.PI * this.flipDir;
    }
    this.flip = { from: flipNow, to: flipTo, t0: now };
    this.carry = turns(this.ambient);
    this.tumbleCarry = { spin: turns(this.tumble.spin), tip: turns(this.tumble.tip) };
    this.from = { ...this.current, pose: { ...this.current.pose } };
    if (this.state === "working") {
      this.workStart = this.start;
      this.workEnd = (now - this.start) / 1000;
    }
    if (state === "working") this.workEnd = Infinity;
    this.state = state;
    this.start = now;
  }

  private targets(state: BotState) {
    return {
      dots: state === "thinking" ? 1 : 0,
      bang: state === "blocked" ? 1 : 0,
      rib: state === "working" ? 1 : 0,
    };
  }

  private flipAngle(now: number) {
    const face = this.choreography[this.state].face;
    const p = this.calm ? 1 : sampleClip(face, (now - this.flip.t0) / 1000);
    return lerp(this.flip.from, this.flip.to, p);
  }

  private turnAngle(now: number) {
    if (!this.turn) return 0;
    const elapsed = (now - this.turn.t0) / 1000;
    const p = sampleCurve(this.tuning.spin, elapsed, curveLength(this.tuning.spin));
    const rest = turns(this.turn.to);
    if (elapsed > 0.2 && Math.abs(1 - p) < 1e-3 && Math.min(rest, TAU - rest) < 1e-6) {
      this.turn = null;
      return 0;
    }
    return lerp(this.turn.from, this.turn.to, p);
  }

  frame(now: number) {
    const dt = this.last ? clamp((now - this.last) / 1000, 0, 0.05) : 0;
    this.last = now;
    const { tuning, calm, state } = this;
    const clips = this.choreography[state];
    const elapsed = calm ? Infinity : (now - this.start) / 1000;
    const progress = (name: keyof typeof clips) => (calm ? 1 : sampleClip(clips[name], elapsed));

    const target = this.targets(state);
    const pPose = progress("pose");
    const pLids = progress("lids");
    const pToken = progress("token");
    const dots = lerp(this.from.dots, target.dots, pToken);
    const bang = lerp(this.from.bang, target.bang, pToken);
    const rib = lerp(this.from.rib, target.rib, progress("ribbons"));
    const goal = tuning.poses[state];
    const pose = {} as BotPose;
    for (const key of POSE_KEYS)
      pose[key] = lerp(this.from.pose[key], goal[key], LID_KEYS.has(key) ? pLids : pPose);
    if (!calm) {
      this.swayPhase += (dt * TAU) / Math.max(pose.swayPeriod, 0.05);
      this.breathPhase += (dt * TAU) / Math.max(pose.breathPeriod, 0.05);
    }

    // A turn carried over from the last state settles to the nearest full turn as the pose settles.
    const settle = (angle: number) => lerp(angle, angle > Math.PI ? TAU : 0, pPose);
    const sweep = sweepAt(
      elapsed,
      !calm && state === "working" ? clips.sweep : undefined,
      tuning.working.sweepEvery,
    );
    const ambient = settle(this.carry) + sweep.turn;
    const tumble = { spin: settle(this.tumbleCarry.spin), tip: settle(this.tumbleCarry.tip) };
    let hop = this.from.hop * (1 - pPose);
    const party =
      !calm && state === "done" ? doneFrame(elapsed, clips, tuning.done, this.flipDir) : null;
    if (party) {
      tumble.spin += party.tumble.spin;
      tumble.tip += party.tumble.tip;
      hop += party.hop;
    }
    if (party?.burst) this.confetti.burst(party.burst, tuning.done.confetti);
    else if (!party) this.confetti.hide();
    this.ambient = ambient;
    this.tumble = tumble;
    this.current = { dots, bang, rib, pose, hop };

    const mood = this.mood.frame(now, dt, calm, tuning);
    const heading = tumbleHeading(this.gaze.look, tumble);
    const look = this.gaze.frame(now, dt, {
      state,
      gaze: tuning.gaze,
      calm,
      jumping: mood.jumping,
      sweeping: sweep.sweeping,
    });
    // Looking turns the whole head, so the face is carried round with it.
    const turn = this.turnAngle(now) + this.flipAngle(now) + ambient;
    const points = this.outline.frame(now, {
      spin: turn + heading,
      lat: look.lat,
      round: clamp(dots + bang, 0, 1),
      morph: tuning.morph,
      calm,
    });
    const token = this.tokens.frame(now, {
      elapsed,
      dots,
      bang,
      leanX: pose.leanX,
      calm,
      thinking: tuning.thinking,
      blocked: tuning.blocked,
    });

    const { jump } = mood;
    const sway = calm ? 0 : pose.sway * Math.sin(this.swayPhase) * (1 - jump.still);
    const breath = 1 + (calm ? 0 : pose.breath * Math.sin(this.breathPhase));
    this.body.setAttribute("transform", `translate(0 ${fixed(hop + jump.hop)})`);
    this.head.setAttribute(
      "transform",
      `translate(${fixed(pose.leanX)} ${fixed(pose.leanY + token.drop)}) rotate(${fixed(pose.tilt * (1 - jump.still) + sway + jump.tilt)}) translate(0 ${fixed(-100 * token.scale * jump.squash)}) scale(${fixed(token.scale * (1 + jump.squash) ** -0.7, 4)} ${fixed(token.scale * breath * (1 + jump.squash), 4)})`,
    );
    this.head.setAttribute("opacity", fixed(token.opacity, 3));

    this.eyes.frame({
      points,
      lon: look.lon,
      lat: look.lat,
      turn,
      tumble,
      pose,
      blink: this.blink.lid(now, state, tuning.blink, calm),
      tilt: mood.tilt,
      smile: mood.smile,
      presence: token.presence,
      eyes: tuning.eyes,
    });

    const worked = state === "working" ? elapsed : (now - this.workStart) / 1000;
    const sweeps =
      !calm && rib > 0.004
        ? comets(worked, this.workEnd, this.choreography.working.sweep, tuning.working, rib)
        : [];
    const atoms = party ? atomRibbons(party.atom, tuning) : [];
    this.ribbons.draw([...sweeps, ...atoms], tuning.working.width);
  }
}
