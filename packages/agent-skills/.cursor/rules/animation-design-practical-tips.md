# Practical Animation Tips

## Debugging

### Record the animation

If the motion feels off and you cannot explain why, record it and inspect it frame by frame. This is the fastest way to spot:

- awkward pauses
- bad easing
- transform-origin mistakes
- tiny shakes
- overly long settling

### Fix shaky motion

If the element shakes while moving, first check whether you are animating layout properties. Replace them with transforms.

```css
.element {
  will-change: transform;
}
```

Use `will-change` deliberately, not everywhere.

## Timing

### Keep UI motion under 300ms

That is the default rule for product UI. Go longer only if:

- the element is very large
- the motion is illustrative
- the custom easing starts very fast and still feels responsive

### Avoid delay

Delay makes interfaces feel unresponsive. Use it only for controlled stagger, and keep it small.

### Remove motion from repeated interactions

Do not animate:

- keyboard navigation
- shortcut responses
- interactions users trigger constantly

Repeated hover effects also deserve scrutiny. Often the best fix is removing them.

## Easing

### Use stronger custom curves

Built-in CSS easings are often too weak for expressive product motion. Reach for custom curves when the animation feels lifeless.

### Choose easing by motion type

- enter: `ease-out`
- move/morph: `ease-in-out`
- hover/color/opacity: `ease`
- constant-time feedback: `linear`
- pure exit: sometimes `ease-in`

### Keep grouped elements in sync

If two elements belong to the same motion event, give them the same timing feel.

Examples:

- dialog and backdrop
- tooltip and arrow
- drawer and overlay

## Transform Tips

### Prefer percentages for travel

When the element's size can vary, percentages are more robust than pixels.

```css
.toast {
  transform: translateY(100%);
}
```

### Never scale from zero for normal UI

This feels unnatural and abrupt.

Prefer:

```css
.element[data-starting-style] {
  opacity: 0;
  transform: scale(0.97);
}
```

### Set transform origin correctly

Popovers, menus, and tooltips should animate from the trigger direction, not from the center.

```css
.popover {
  transform-origin: var(--transform-origin);
}
```

### Animate a child to avoid hover flicker

If the hovered element itself moves, the pointer can slip off it and cause flicker.

```css
.card:hover .card-inner {
  transform: translateY(-20%);
}

.card-inner {
  transition: transform 200ms ease;
}
```

## Interaction Patterns

### Button press feedback

```css
button {
  transition: transform 150ms ease;
}

button:active {
  transform: scale(0.97);
}
```

### Tooltips and popovers

- use `transform-origin`
- start from a near-real scale, not `0`
- skip delay and animation when another tooltip is already open

```css
.tooltip {
  transition:
    transform 125ms cubic-bezier(0.19, 1, 0.22, 1),
    opacity 125ms cubic-bezier(0.19, 1, 0.22, 1);
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

### Disable hover on touch devices

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.05);
  }
}
```

### Preserve keyboard access

If content appears on hover, mirror the same reveal for `:focus-visible`.

## Accessibility

### Use larger hit areas

Small icons should still have at least a `44px` tap target.

```css
.touch-hitbox {
  position: relative;
}

.touch-hitbox::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}
```

### Respect reduced motion

Reduce or remove non-essential motion when the user asks for less motion.

## Last Resort

### Add a tiny blur

If the timing and easing are already right but the motion still feels slightly harsh, a subtle `blur()` can smooth the transition. This is a last resort, not a substitute for fixing the real issue.
