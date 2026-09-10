---
name: Clinical Dark Terminal
colors:
  surface: '#101418'
  surface-dim: '#101418'
  surface-bright: '#363a3e'
  surface-container-lowest: '#0b0f13'
  surface-container-low: '#181c20'
  surface-container: '#1c2024'
  surface-container-high: '#262a2f'
  surface-container-highest: '#31353a'
  on-surface: '#e0e3e8'
  on-surface-variant: '#bbcac6'
  inverse-surface: '#e0e3e8'
  inverse-on-surface: '#2d3135'
  outline: '#859490'
  outline-variant: '#3c4947'
  surface-tint: '#4fdbc8'
  primary: '#4fdbc8'
  on-primary: '#003731'
  primary-container: '#14b8a6'
  on-primary-container: '#00423b'
  inverse-primary: '#006b5f'
  secondary: '#80d5cb'
  on-secondary: '#003733'
  secondary-container: '#007068'
  on-secondary-container: '#9af0e5'
  tertiary: '#3cddc7'
  on-tertiary: '#003731'
  tertiary-container: '#00b8a5'
  on-tertiary-container: '#00423a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71f8e4'
  primary-fixed-dim: '#4fdbc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#101418'
  on-background: '#e0e3e8'
  surface-variant: '#31353a'
  surface-base: '#06090C'
  surface-raised: '#0E1318'
  surface-overlay: '#161D24'
  border-subtle: '#1E2730'
  border-strong: '#2C3946'
  text-primary: '#F1F5F9'
  text-secondary: '#94A3B8'
  text-muted: '#64748B'
  status-critical: '#E11D48'
  status-critical-bg: '#2A0A12'
  status-warning: '#F59E0B'
  status-warning-bg: '#2B1A04'
  status-success: '#16A34A'
  status-success-bg: '#062312'
  badge-controlled: '#BE123C'
  badge-controlled-text: '#FFE4E6'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-md:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Geist
    fontSize: 9px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
  data-tabular-lg:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.03em
  data-tabular-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
spacing:
  gap-2xs: 0.125rem
  gap-xs: 0.25rem
  gap-sm: 0.5rem
  gap-md: 0.75rem
  gap-lg: 1rem
  gap-xl: 1.5rem
  gap-2xl: 2rem
  gutter-mobile: 0.75rem
  margin-mobile: 0.75rem
  row-dense: 2.25rem
  row-standard: 3rem
---

## Brand & Style

The design system embodies a high-density, surgical-grade inventory and POS interface calibrated specifically for mobile handheld operation in high-pace pharmaceutical environments. Built with a brutalist, terminal-inspired precision, it discards decorative softness in favor of raw informational utility, optical clarity under harsh overhead clinic lighting, and immediate mechanical responsiveness.

The interface prioritizes two primary workflows: split-second barcode optical capture and mission-critical inventory validation (FEFO verification, batch serialization, scheduled substance auditing). The aesthetic pairs deep, anti-glare obsidian surfaces with high-frequency medical teal identifiers and sharp alert channels (amber for shelf decay, crimson for stock depletion and scheduled classifications). Every pixel edge is resolute—zero border radius throughout—projecting the reliable rigor of an enterprise clinical workstation directly onto handheld dispensary hardware.

## Colors

The palette operates under an uncompromising dark mode framework engineered for high-contrast scan readability and eye strain mitigation during extended twelve-hour shifts. 

The primary hue (`#14B8A6`) acts as the active beacon across all interactive mechanisms—scanner triggers, active batch selections, and primary confirm states. `#0F766E` serves as a structural secondary for tab matrices and grouped borders, while `#2DD4BF` illuminates focused elements and high-frequency active indicators.

Background structures utilize cold, blue-shifted blacks (`#06090C` to `#161D24`) rather than neutral grays, yielding superior contrast separation between tabular layers without light bleed. The urgency hierarchy is absolute:
- **Critical / Scheduled / Shortage (`#E11D48`)**: Denotes sub-zero inventory, prescription verification locks, or Schedule II/controlled tracking alerts.
- **Warning / Expiry Alert (`#F59E0B`)**: Marks inventory batches approaching the 30/60/90-day expiration window under FEFO protocol.
- **Success / Verified (`#16A34A`)**: Signals verified batch scanning, register balance matches, and authenticated transactions.

## Typography

Typography balances industrial authority with dense data consumption. **Space Grotesk** commands the top levels, introducing a geometric, terminal-inspired cadence for screens, section delimiters, and financial metrics. **Geist** handles the extensive informational throughput required for pharmaceutical inventory—lot identifiers, chemical denominations, pack quantities, and system notifications.

Numerical readability is critical. Currency values, stock tallies, NDC/barcodes, and dates must be rendered with tabular figures (`font-variant-numeric: tabular-nums`) to prevent optical wobble during live counter changes and data grid vertical scans. All label variations utilize upper-case formatting with deliberate tracking at `label-sm` to maintain total legibility at minimal sizes across 390px viewports.

## Layout & Spacing

The layout is built for maximum spatial density on compact screens, standardizing on a 390px mobile baseline width. It rejects spacious decorative margins in favor of an uninterrupted 4px architectural grid rhythm. Edge padding is restricted to `0.75rem` (`gutter-mobile`), granting maximum horizontal width for batch strings, drug nomenclature, and currency values.

Vertical structures operate on rigid functional rhythms:
- **Dense Data Rows (`2.25rem` / 36px)**: Used for scan logs, cart entries, and batch selection lists to ensure at least 8 to 10 items fit above the digital fold without scrolling.
- **Interactive Action Bars (`3rem` / 48px to 56px)**: Enforces thumb-accessible heights for checkout triggers, camera barcode toggles, and drawer actions.

Reflow behavior strictly prevents multi-line text wrapping for numerical attributes: values truncate or compress typography, while structural dividers rely on crisp, high-contrast single-pixel rule lines rather than white-space separation.

## Elevation & Depth

This design system avoids all diffuse, organic drop shadows and blurred skeuomorphic layers. Instead, depth and z-index strata are established entirely through **Tonal Stacking and High-Contrast Structural Outlines**.

1. **Baseplate (`surface-base` #06090C)**: The deepest visual floor, reserved for underlying application canvases and camera scanner backdrops.
2. **Structural Slabs (`surface-raised` #0E1318)**: Standard container for cards, inventory rows, and form inputs. Defined by a solid 1px perimeter outline (`border-subtle` #1E2730).
3. **Elevated Panels & Flyouts (`surface-overlay` #161D24)**: Overlays, bottom checkout sheets, modal confirmations, and pinned action strips. Outlined with a high-contrast 1px border (`border-strong` #2C3946) or direct `primary_color_hex` accent border.
4. **Active Scanner Horizon**: Real-time camera viewfinder overlays feature a high-intensity 2px bounding box (`#14B8A6`) with zero drop shadow, framed by sharp right-angle mechanical reticles.

## Shapes

The shape system enforces an absolute zero-radius policy (`roundedness: 0`). Every visual unit—including buttons, input matrices, notification toasts, badges, sheets, and image holders—is rendered with strict 90-degree right angles (`border-radius: 0px`).

This uncompromising geometry reinforces the clinical, industrial, and highly disciplined nature of medical software. It eliminates wasted interior padding common to rounded corner containers, allowing content to sit flush against boundaries for superior data density across small touchscreens.

## Components

### Buttons
- **Primary Execution**: Fully filled in `#14B8A6` with solid `#06090C` text. Square corners (`0px`), height of `48px` on mobile for rapid touch targeting. Hover/active states trigger a shift to `#2DD4BF`. Space Grotesk bold uppercase typography.
- **Secondary / Action Frame**: Transparent surface with a 1px solid border (`#2C3946`) and `#F1F5F9` label. Active state triggers a full invert: `#F1F5F9` fill with `#06090C` text.
- **Urgent / Halt**: Background of `#E11D48` with `#FFFFFF` text. Used exclusively for destructive adjustments, flagged item removal, and voiding sales.

### Badges & Status Chips
- Height: Fixed at `20px` or `24px`, zero-radius block structure with 1px borders.
- **Controlled Substance Tag**: Solid `#2A0A12` fill, 1px `#BE123C` border, `#FFE4E6` Space Grotesk uppercase text.
- **Expiry Flag (FEFO)**: Solid `#2B1A04` fill, 1px `#F59E0B` border, `#F59E0B` Geist tabular text (e.g., `EXP: 24D`).
- **In-Stock Check**: Solid `#062312` fill, 1px `#16A34A` border, `#16A34A` text.

### Inputs & Barcode Fields
- **Terminal Entry Field**: Height `44px`, background `#0E1318`, 1px solid `#1E2730` border. Active focus shifts the border directly to 1px `#14B8A6` without a glow halo.
- **Scanner-Integrated Input**: Pairs an inline monospaced numeric input with an anchored zero-radius square camera icon button (`44px` × `44px`) on the right margin.

### Cards & Inventory Rows
- **Inventory Row Item**: Fixed `64px` height unit. Dark slab `#0E1318` partitioned by bottom 1px `#1E2730` border. Left-aligned chemical/brand designation and packaging unit; right-aligned tabular price and batch quantity counter. Contains a dedicated status color marker running 3px along the extreme left edge.
- **Batch Selection Card**: Tonal block displaying batch code, supplier provenance, and FEFO expiry sequence. If batch is expiring nearest, highlight entire card with a 1px `#F59E0B` border.

### Floating Cart & Barcode Scanner Overlay
- **Docked Action Bar**: Pinned to bottom viewport edge (`0px` bottom/left/right margin). Surface `#161D24` with top 2px solid `#14B8A6` rule. Splits horizontally into current item count/total profit/revenue on the left, and full-width checkout trigger button on the right.
- **Targeting Reticle**: Viewfinder camera interface bordered by transparent dark overlay (`rgba(6, 9, 12, 0.8)`), framing a central scan window delineated by 2px high-voltage teal corners.