#!/usr/bin/env python3
"""Hero/OG image for /blog/every-signal-was-green (WO-ASA-BLOG-NVO-001 T2).

Flat-vector editorial infographic, authored as SVG and rasterized to a
1200x630 PNG with cairosvg. Motif per the WO: an aircraft nosedive path with
floor markers at -20/-30/-40/-50, an ejection-seat marker at the 55-60%% zone,
a -70%% floor, and the mono footer line. ASA brand palette. No stock photos,
no candlesticks, no logos, no faces, no prices (percentages only).

Usage:  python3 scripts/make-blog-hero.py
Writes: public/blog/every-signal-was-green/hero.svg (+ og.png)
"""
from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "blog" / "every-signal-was-green"

# Palette (src/index.css)
BG = "#0a0e1a"
SURFACE = "#151d35"
BORDER = "#1e293b"
TEXT = "#f1f5f9"
TEXT2 = "#94a3b8"
MUTED = "#64748b"
ACCENT = "#22d3ee"
SELL = "#ef4444"
BUY = "#22c55e"

W, H = 1200, 630

# Chart area: y=0% line near the top, floors evenly spaced below.
X0, X1 = 90, 1110          # plot left/right
Y_TOP, Y_BOT = 120, 520     # 0% .. -80% band


def y_pct(pct_down: float) -> float:
    """Map a drawdown percentage (0..80) to a y pixel."""
    return Y_TOP + (Y_BOT - Y_TOP) * (pct_down / 80.0)


def floor_line(pct: int, color: str, label_color: str, dash: str = "7 7") -> str:
    y = y_pct(pct)
    return (
        f'<line x1="{X0}" y1="{y:.0f}" x2="{X1}" y2="{y:.0f}" stroke="{color}" '
        f'stroke-width="1.5" stroke-dasharray="{dash}"/>'
        f'<text x="{X1 + 8}" y="{y + 5:.0f}" font-family="DejaVu Sans Mono, monospace" '
        f'font-size="17" fill="{label_color}">-{pct}%</text>'
    )


# ── Nosedive path ────────────────────────────────────────────────────────────
# From 0% at the left, plunging with a small bounce ("a fresh reason to hold")
# at each floor, ejection at -57.5%, continuing to -70%, pulling up at the end.
def px(frac: float) -> float:
    return X0 + (X1 - X0) * frac


dive_pts = [
    (px(0.02), y_pct(0)),
    (px(0.10), y_pct(4)),
    (px(0.16), y_pct(20)),   # first floor
    (px(0.21), y_pct(16)),   # bounce
    (px(0.28), y_pct(30)),
    (px(0.33), y_pct(26)),
    (px(0.41), y_pct(40)),
    (px(0.46), y_pct(36)),
    (px(0.54), y_pct(50)),
    (px(0.58), y_pct(47)),
    (px(0.66), y_pct(57.5)),  # ejection point
]
after_pts = [
    (px(0.66), y_pct(57.5)),
    (px(0.78), y_pct(66)),
    (px(0.88), y_pct(70)),   # the -70% floor
    (px(0.97), y_pct(65)),   # pulls up just before ground level
]

dive_path = "M " + " L ".join(f"{x:.0f} {y:.0f}" for x, y in dive_pts)
after_path = "M " + " L ".join(f"{x:.0f} {y:.0f}" for x, y in after_pts)
ex, ey = dive_pts[-1]

# Flat-vector paper-plane silhouette at the start of the dive, nose down-right.
plane_x, plane_y = px(0.055), y_pct(2.5)
plane = f'''
<g transform="translate({plane_x:.0f} {plane_y:.0f}) rotate(30)">
  <path d="M 54 0 L -10 -16 L 6 0 L -10 16 Z" fill="{TEXT2}"/>
  <path d="M 54 0 L 6 0 L 2 10 Z" fill="{MUTED}"/>
</g>'''

# Ejection seat glyph: seat + occupant chute arrow, accent color.
seat = f'''
<g transform="translate({ex:.0f} {ey:.0f})">
  <circle r="26" fill="{BG}" stroke="{ACCENT}" stroke-width="2.5"/>
  <!-- seat: L-shaped chair -->
  <path d="M -8 12 L -8 -6 L 8 -6" stroke="{ACCENT}" stroke-width="4.5"
        fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- eject arrow -->
  <path d="M 2 4 L 2 -14 M -4 -8 L 2 -14 L 8 -8" stroke="{ACCENT}"
        stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<text x="{ex + 36:.0f}" y="{ey - 18:.0f}" font-family="DejaVu Sans Mono, monospace"
      font-size="19" font-weight="bold" fill="{ACCENT}">EJECT: -55&#8211;60%</text>'''

# Green signal row (top): "every signal was green" while the dive ran.
signals = "".join(
    f'<circle cx="{px(0.03) + i * 26:.0f}" cy="62" r="7" fill="{BUY}"/>' for i in range(5)
)

grid = "".join(
    f'<line x1="{px(f):.0f}" y1="{Y_TOP - 18}" x2="{px(f):.0f}" y2="{Y_BOT + 14}" '
    f'stroke="{BORDER}" stroke-width="1" opacity="0.55"/>'
    for f in (0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875)
)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{BG}"/>
  {grid}

  <!-- signal row -->
  {signals}
  <text x="{px(0.03) + 5 * 26 + 8:.0f}" y="68" font-family="DejaVu Sans Mono, monospace"
        font-size="17" letter-spacing="2" fill="{BUY}">SIGNALS: ALL GREEN</text>

  <!-- 0% reference -->
  <line x1="{X0}" y1="{y_pct(0):.0f}" x2="{X1}" y2="{y_pct(0):.0f}" stroke="{TEXT2}" stroke-width="1.5"/>
  <text x="{X1 + 8}" y="{y_pct(0) + 5:.0f}" font-family="DejaVu Sans Mono, monospace"
        font-size="17" fill="{TEXT2}">0%</text>

  <!-- floors -->
  {floor_line(20, BORDER, MUTED)}
  {floor_line(30, BORDER, MUTED)}
  {floor_line(40, BORDER, MUTED)}
  {floor_line(50, MUTED, TEXT2)}
  {floor_line(70, SELL, SELL, dash="4 6")}

  <!-- 50% cushion band annotation -->
  <text x="{X0}" y="{y_pct(50) - 8:.0f}" font-family="DejaVu Sans Mono, monospace"
        font-size="16" fill="{TEXT2}">THE 50% CUSHION</text>
  <text x="{X0}" y="{y_pct(70) - 8:.0f}" font-family="DejaVu Sans Mono, monospace"
        font-size="16" fill="{SELL}">THE FLOOR</text>

  <!-- the dive -->
  <path d="{dive_path}" fill="none" stroke="{SELL}" stroke-width="5"
        stroke-linejoin="round" stroke-linecap="round"/>
  <path d="{after_path}" fill="none" stroke="{SELL}" stroke-width="3.5"
        stroke-dasharray="9 8" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>
  {plane}
  {seat}

  <!-- footer line -->
  <rect x="0" y="{H - 62}" width="{W}" height="62" fill="{SURFACE}"/>
  <text x="{W / 2:.0f}" y="{H - 24}" text-anchor="middle"
        font-family="DejaVu Sans Mono, monospace" font-size="24" letter-spacing="3"
        fill="{TEXT}">MY 50% CUSHION MET A 70% FLOOR</text>
</svg>'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "hero.svg").write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(OUT / "og.png"),
                     output_width=W, output_height=H)
    print(f"wrote {OUT / 'hero.svg'} and {OUT / 'og.png'}")


if __name__ == "__main__":
    main()
