---
name: animation-design
description: Use this skill when designing or reviewing web animations, easing, timing, springs, transitions, hover states, motion performance, accessibility, or when the user says an interaction feels off, janky, sluggish, or unnatural.
---

# Animation Design

Use this skill for product UI motion.

Default stance:

- fast
- subtle
- transform-based
- low delay
- purposeful

An animation feels right when it:

- mirrors familiar motion
- has a clear purpose
- shows restraint and taste

If motion does not improve clarity, feedback, continuity, or perceived responsiveness, remove it.

## Decision Order

For any motion task:

1. Identify the purpose.
2. Classify the motion as enter, exit, move, morph, or state change.
3. Choose easing.
4. Choose duration.
5. Choose implementation primitive.
6. Check frequency, performance, and accessibility.

## Motion Defaults

- Keep most UI motion under `300ms`.
- Prefer `transform` and `opacity`.
- Avoid delay for direct user feedback.
- Do not animate keyboard-driven interactions.
- Be skeptical of animation on frequently used controls.

## Easing Rules

- Entering elements: use `ease-out` or a stronger custom ease-out.
- On-screen movement, resizing, or morphing: use `ease-in-out` or a spring.
- Hover, color, opacity, and other gentle transitions: use `ease`.
- Constant-speed or time-based visuals: use `linear`.
- Use `ease-in` only for simple exits when it genuinely feels better.

Built-in CSS easings are often too weak. If motion feels lifeless, prefer stronger custom curves.

## Duration Rules

- Micro feedback: around `100ms` to `150ms`
- Standard product UI: around `150ms` to `250ms`
- Most UI should stay under `300ms`
- Larger or visually heavier elements can go slightly longer

A steep custom curve can support a longer duration without feeling slow.

## Springs

Use springs when motion should feel physical, interruptible, or attached to touch:

- drag and release
- sheets and drawers
- motion that should preserve momentum when interrupted

Tune springs to settle quickly. Extra bounce is usually a mistake in serious product UI.

## Implementation Rules

- Avoid animating layout properties if `transform` would work.
- Prefer percentages for travel when element size can vary.
- Avoid `transition: all`.
- Use transitions for interactive state changes and interruption.
- Use keyframes for loops, autoplay sequences, and fixed timelines.

## Performance Rules

- Animate `transform` and `opacity` by default.
- Avoid animating `top`, `left`, `width`, `height`, `margin`, and `padding` unless there is a strong reason.
- Prefer CSS transitions or keyframes for simple motion. Use JS-driven motion only when you need springs, interruption, gestures, or dynamic choreography.
- Be careful with blur and filter effects. Keep them subtle.
- Use `will-change` deliberately, not everywhere.
- In React-style UIs, avoid frame-by-frame state updates when a transform, CSS variable, or motion primitive would work better.
- If motion feels janky, check the animated property before changing easing or duration.

## Taste Rules

- Prefer polish over spectacle.
- Keep travel distance modest.
- Never animate from `scale(0)` for normal UI. Start near reality, like `0.95`.
- Animate popovers and tooltips from the trigger, not the center.
- If hover motion shifts the hit area, animate a child instead of the hovered parent.
- Repeated interactions should get quieter, not more expressive.

## Debugging Workflow

When the motion feels wrong:

1. Record it.
2. Inspect it frame by frame.
3. Check easing before changing duration.
4. Check transform-origin.
5. Check movement distance.
6. Check whether layout properties are causing shake.

For implementation patterns and edge-case fixes, read [the practical tips reference](references/practical-tips.md).
