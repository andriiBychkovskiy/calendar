/** Default for missing / unreadable colors — matches app `text.primary`, readable on white. */
const VISIBLE_DEFAULT_COLOR = '#1E293B';

/** WCAG relative luminance; colors above this read as “pastel on white” → use default. */
const MAX_COLOR_LUMINANCE = 0.62;

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.trim();
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Ensures chart/list colors are visible on white (pastel presets → dark default). */
export function normalizeStatColor(color: string | undefined): string {
  if (!color?.trim()) return VISIBLE_DEFAULT_COLOR;
  const rgb = parseHexRgb(color);
  if (!rgb) return VISIBLE_DEFAULT_COLOR;
  const L = relativeLuminance(rgb.r, rgb.g, rgb.b);
  if (L > MAX_COLOR_LUMINANCE) return VISIBLE_DEFAULT_COLOR;
  return color.trim();
}
