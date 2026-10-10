export type VoiceEnvelope = { level: number; velocity: number };

/** Exact critically damped step. Retargets immediately; never queues input. */
export function followVoice(
  envelope: VoiceEnvelope,
  target: number,
  dt: number,
  rise: number,
  fall: number,
) {
  const duration = Math.max(0.06, target > envelope.level ? rise : fall);
  const omega = 4.6 / duration;
  const displacement = envelope.level - target;
  const momentum = envelope.velocity + omega * displacement;
  const decay = Math.exp(-omega * dt);
  envelope.level = target + (displacement + momentum * dt) * decay;
  envelope.velocity = (envelope.velocity - omega * momentum * dt) * decay;
  if (envelope.level < 0 || envelope.level > 1) {
    envelope.level = Math.max(0, Math.min(1, envelope.level));
    envelope.velocity = 0;
  }
}
