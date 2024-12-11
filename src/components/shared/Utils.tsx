export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function getTextPositionAbovePolygon(x, y, r, n, offset = 10) {
  // Topmost vertex of the polygon
  const topmostX = x; // For a regular polygon, the topmost X aligns with the center X
  const topmostY = y - r; // Topmost Y is radius above the center

  // Text position slightly above the polygon
  const textPositionX = topmostX;
  const textPositionY = topmostY - offset;

  return { textPositionX, textPositionY };
}
