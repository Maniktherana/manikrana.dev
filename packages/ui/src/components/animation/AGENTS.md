# Animation Craft Guide

This file is for agents making or reviewing animations in this package.

Assume product UI by default, not marketing. Bias toward fast, subtle, purposeful motion.

## Core Principle

An animation feels right when it:

- mirrors familiar real-world motion
- has a clear purpose
- shows good taste

If you cannot explain why motion improves clarity, feedback, continuity, or perceived responsiveness, do not animate.

## Default Mental Model

- Motion is part of UX, not decoration.
- Easing matters more than almost anything else.
- Perceived speed matters as much as actual speed.
- Taste is mostly restraint: less distance, less delay, less drama.
- Repeated interactions should get quieter, not more expressive.

## First Questions

Before adding motion, answer:

1. What changed?
2. What should the user understand from the motion?
3. How often will the user see this?
4. Is this entering, exiting, moving, or just changing state?
5. Can this be done with `transform` and `opacity`?

## Animation Defaults

- Keep most UI motion under `300ms`.
- Default to `transform` and `opacity`.
- Prefer percentages for `translate` when element size can vary.
- Do not animate keyboard-driven interactions.
- Be skeptical of hover animation on frequently used controls.
- Avoid delay unless it improves readability. If staggering, keep it around `30ms` per item or less.

## Easing Rules

- Entering elements: use `ease-out` or a stronger custom ease-out.
- On-screen movement, resizing, or morphing: use `ease-in-out` or a spring.
- Hover, color, opacity, and other gentle transitions: use `ease`.
- Constant-speed or time-based visuals: use `linear`.
- Standalone exits can use `ease-in`, but do not use it as a generic UI default.
- Built-in CSS curves are often too weak; prefer stronger custom curves when the motion feels lifeless.

If multiple elements are part of one motion event, keep their easing and duration aligned.

## Spring Rules

Use springs when motion should feel physical, interruptible, or attached to user input:

- drag and release
- sheets, drawers, and touch-first panels
- organic movement that should settle naturally

Tune springs to settle quickly. Extra bounce is usually noise unless the interaction is intentionally playful.

## Taste Rules

- Prefer polish over spectacle.
- Keep travel distance modest.
- Never animate from `scale(0)` unless the effect is intentionally surreal. Start closer to reality, like `0.95`.
- Add blur only as a last resort to hide minor imperfections.
- Popovers, menus, and tooltips should animate from their trigger, not from the center.
- If a hover animation moves the hit target, animate a child element instead of the hovered parent.

## Practical Heuristics

- Bigger elements can animate slightly slower than smaller ones.
- A steep custom easing can support a longer duration without feeling slow.
- Use tiny press feedback like `scale(0.97)` for buttons.
- Disable hover effects on touch devices.
- Ensure tap targets are at least `44px`.
- When text or icons need transforms, ensure they have a box, for example `display: inline-block`.

## Implementation Bias

- Use CSS transitions for simple interactive state changes and cases that need interruption.
- Use keyframes for loops, autoplay sequences, and multi-step timelines.
- Use springs or motion libraries when continuity and interruptibility matter more than fixed timing.

## Performance Rules

- Animate `transform` and `opacity` by default. Treat every other animated property as suspect until justified.
- Avoid animating layout-affecting properties like `top`, `left`, `width`, `height`, `margin`, and `padding`.
- Prefer CSS transitions or keyframes for simple motion. Reach for JS-driven motion only when you need springs, interruption, gestures, or dynamic choreography.
- Be careful with blur and filter effects. Keep them subtle and do not use them as the first fix for bad motion.
- Use `will-change` deliberately on elements that visibly shake or need stable GPU promotion, then remove it if it is not helping.
- If using React or another UI runtime, avoid driving animation with state updates on every frame when a transform, CSS variable, or motion library primitive would do.
- When motion feels janky, check the property being animated before changing easing or duration.

## Red Flags

- `ease-in` used for everything
- long delays before feedback
- layout properties animated instead of transforms
- bounce on routine product UI
- animations users trigger hundreds of times a day
- tooltip or popover scaling from center instead of trigger
- scale-in from `0`
