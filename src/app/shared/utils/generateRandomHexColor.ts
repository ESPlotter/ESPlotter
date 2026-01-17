export function generateRandomHexColor(): string {
  let hash = 0;
  for (let i = 0; i < 10; i++) {
    hash = (hash << 5) - hash + Math.floor(Math.random() * 256);
    hash |= 0;
  }
  const r = (hash >> 16) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = hash & 0xff;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}