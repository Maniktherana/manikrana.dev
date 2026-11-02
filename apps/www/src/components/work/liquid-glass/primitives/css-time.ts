// The production minifier rewrites "302ms" as ".302s", so a CSS time is read with its unit.
export function cssTime(node: Element, name: string) {
  const value = getComputedStyle(node).getPropertyValue(name).trim();
  return parseFloat(value) * (value.endsWith("ms") ? 1 : 1000);
}
