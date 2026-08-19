# Design System Specification (DESIGN_SYSTEM.md)
## Project: Falcon Electricals – B2B Electrical Switch & Showcase Platform
**Document Version:** 2.0.0  
**Design Philosophy:** Industrial Craftsmanship, Mathematical Precision, High-Contrast Readability & Accessible B2B Utility.

---

## 1. Brand Identity & Design Philosophy

Falcon Electricals' design system reflects **industrial reliability, electrical precision, and modern architectural aesthetics**. It avoids generic AI clichés ("AI Slop"), gradient text, purple-to-blue glow, and arbitrary glassmorphism in favor of crisp typography, tactile surfaces, high-contrast borders, and ergonomic touch targets.

### Core Principles:
1. **Utility-First B2B Architecture:** Information density is optimized for quick scanning of technical electrical specs (Amperage, Voltage, Module sizes, FR Polycarbonate ratings).
2. **Tactile Industrial Aesthetic:** Crisp borders (1px solid slate/zinc), subtle shadows, and tactile surface feedback mimicking premium switchgear.
3. **Ergonomic Mobile Touch Design:** Every interactive button, pill, and input provides a minimum 44px touch target on mobile devices.
4. **Accessible High-Contrast:** 100% WCAG AA compliance with a minimum 4.5:1 contrast ratio for body copy and 3:1 for large UI display elements.

---

## 2. Color Palette & Token Architecture

The color system uses a high-contrast industrial palette with **Electric Crimson Red** as the primary brand accent, **Deep Slate & Charcoal** for structural depth, **Pure Arctic White** for switch surfaces, and **Emerald Green** exclusively for WhatsApp B2B conversion triggers.

### 2.1 Primary Brand Colors
| Token Name | Hex Code | Tailwind Equivalent | Use Case |
| :--- | :--- | :--- | :--- |
| `color-primary` | `#E0183D` | `bg-[#E0183D]`, `text-[#E0183D]` | Primary Brand Accent, Key CTAs, Active Tabs, Logo accents |
| `color-primary-hover` | `#C01333` | `hover:bg-[#C01333]` | Primary Button Hover & Active States |
| `color-primary-subtle` | `#FFF1F2` | `bg-rose-50`, `text-rose-700` | Subtle Badges, Active Pill Highlights, Tag backgrounds |
| `color-primary-border` | `#FECDD3` | `border-rose-200` | Accent Borders for active selection |

### 2.2 Neutral & Surface Hierarchy (Dark & Light)
| Token Name | Hex Code | Tailwind Equivalent | Optical Role |
| :--- | :--- | :--- | :--- |
| `surface-canvas` | `#F8FAFC` | `bg-slate-50` | Global Application Background (Soft Cool Off-White) |
| `surface-card` | `#FFFFFF` | `bg-white` | Product Cards, Modals, Flyout Drawers, Input Fields |
| `surface-secondary` | `#F1F5F9` | `bg-slate-100` | Table Headers, Spec Strips, Inactive Tabs, Code Pills |
| `surface-dark-slate`| `#0F172A` | `bg-slate-900` | Header Strip, Dark Hero Panel, Contrast Feature Cards |
| `surface-dark-card` | `#1E293B` | `bg-slate-800` | Admin Panel Surface, Dark Tooltips, Image Gallery Backdrops |

### 2.3 Borders & Separators
| Token Name | Hex Code | Tailwind Equivalent | Rule |
| :--- | :--- | :--- | :--- |
| `border-subtle` | `#E2E8F0` | `border-slate-200` | Standard Card Borders, Dividers, Table Grid lines |
| `border-medium` | `#CBD5E1` | `border-slate-300` | Form Input Outlines, Inactive Pill Outlines |
| `border-dark` | `#334155` | `border-slate-700` | Dark Mode Card Borders, Modal Dividers in Admin |

### 2.4 Functional & Feedback Tokens
| Token Name | Hex Code | Tailwind Equivalent | Purpose |
| :--- | :--- | :--- | :--- |
| `color-whatsapp` | `#25D366` | `bg-[#25D366]`, `text-white` | WhatsApp Direct Chat Triggers & Badges |
| `color-whatsapp-hover`| `#1EBE5D` | `hover:bg-[#1EBE5D]` | WhatsApp Button Hover State |
| `color-success` | `#16A34A` | `bg-emerald-600`, `text-emerald-700`| In-Stock Indicator, Verification Badges |
| `color-warning` | `#F59E0B` | `bg-amber-500`, `text-amber-700` | Low Stock, Important Technical Caution |
| `color-danger` | `#DC2626` | `bg-red-600`, `text-red-700` | Delete SKU, Error Toasts, Disconnect Alert |

### 2.5 Text & Typography Colors
| Token Name | Hex Code | Tailwind Equivalent | Contrast Target |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#0F172A` | `text-slate-900` | 15.8:1 (Ultra-high contrast for H1, H2, Product Titles) |
| `text-secondary` | `#475569` | `text-slate-600` | 7.2:1 (Body text, technical specs, descriptions) |
| `text-muted` | `#64748B` | `text-slate-500` | 4.6:1 (Subtitles, SKU codes, secondary labels) |
| `text-inverse` | `#FFFFFF` | `text-white` | For dark backgrounds and primary action buttons |

---

## 3. Typography Hierarchy & Mathematical Scale

The typography uses a **Major Second (1.125)** step ratio for dense, flexible product spec sheets and a **Major Third (1.25)** step ratio for high-impact marketing headings.

### 3.1 Font Families
* **Primary Display & Headings:** `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif.
* **Technical Monospace / SKU Codes:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace.

### 3.2 Type Scale Specifications

| Element / Class | Font Size | Line Height | Letter Spacing | Weight | Tailwind Classes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | 36px – 44px | 1.15 (44–52px) | `-0.025em` | Bold (700) | `text-3xl sm:text-4xl font-bold tracking-tight text-slate-900` |
| **Section H2** | 28px – 32px | 1.25 (36–40px) | `-0.02em` | Bold (700) | `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900` |
| **Card Title H3** | 18px – 20px | 1.35 (26–28px) | `-0.015em` | SemiBold (600) | `text-lg sm:text-xl font-semibold text-slate-900` |
| **Subhead H4** | 16px – 17px | 1.4 (24px) | `0` | SemiBold (600) | `text-base font-semibold text-slate-800` |
| **Body Standard** | 15px – 16px | 1.6 (24–26px) | `0` | Regular (400) | `text-sm sm:text-base font-normal text-slate-600 leading-relaxed` |
| **Caption / Spec** | 13px – 14px | 1.45 (20px) | `+0.01em` | Medium (500) | `text-xs sm:text-sm font-medium text-slate-500` |
| **SKU Code Pill** | 12px – 13px | 1.2 (16px) | `+0.03em` | Bold (700) | `text-xs font-mono font-bold tracking-wider uppercase` |

---

## 4. Spacing Scale & Layout Grid Rules

All spacing follows an **8-Point Harmonic Mathematical Grid** (with 4px increments for micro-alignments).

### 4.1 Spacing Scale Reference
* `space-1` = `4px` (`p-1`, `gap-1`) – Micro padding, badge offsets.
* `space-2` = `8px` (`p-2`, `gap-2`) – Tight chip padding, icon margins.
* `space-3` = `12px` (`p-3`, `gap-3`) – Inner button vertical padding, table cells.
* `space-4` = `16px` (`p-4`, `gap-4`) – Standard container padding, card inner padding.
* `space-6` = `24px` (`p-6`, `gap-6`) – Desktop card padding, section gap groupings.
* `space-8` = `32px` (`p-8`, `gap-8`) – Modal inner padding, hero column gap.
* `space-12` = `48px` (`py-12`) – Section vertical separation on mobile.
* `space-16` = `64px` (`py-16`) – Major section vertical separation on desktop.

### 4.2 Structural Layout Rules & Padding Math
1. **The 2x Button Padding Rule:** Button horizontal padding must always equal exactly **2x** the vertical padding (e.g. `py-2.5 px-5` or `py-3 px-6`).
2. **Container Outer vs. Inner Rule:** Outer padding of a container must always be $\ge$ the inner gap between its child components.
3. **Viewport Container Constraint:** All page content is wrapped in `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` to prevent unconstrained stretching on ultra-wide 4K monitors.

---

## 5. Border Radius & Elevation (Shadow) System

### 5.1 Border Radius Mathematical Rule
When nesting rounded containers (e.g., a thumbnail container inside a product card):
$$\text{Inner Radius} = \text{Outer Radius} - \text{Padding Distance}$$

* **Pill / Badge:** `rounded-full` (`9999px`) – Exclusively for badges, filter chips, and CTA buttons.
* **Standard Cards:** `rounded-2xl` (`16px`) – Maximum curvature for cards.
* **Inner Thumbnails:** `rounded-xl` (`12px`) – For images inside a 16px card with 16px padding ($16 - 4 \approx 12$).
* **Form Inputs & Buttons:** `rounded-xl` (`12px`) or `rounded-lg` (`8px`).
* **Anti-Pattern Rule:** Thick accent borders ($\ge 3px$) are **never** combined with extreme border radius ($\ge 24px$).

### 5.2 Elevation (Shadow) Tokens
```css
/* Subtle Surface Lift (Resting Card) */
box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
/* Tailwind: shadow-sm border border-slate-200/80 */

/* Hover Lift (Interactive Product Card) */
box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
/* Tailwind: hover:shadow-lg hover:-translate-y-0.5 transition-all */

/* Modal & Flyout Elevation */
box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
/* Tailwind: shadow-2xl */
```

---

## 6. Interactive Component Specifications

### 6.1 Button Hierarchy & Matrix

```
+-----------------------------------------------------------------------------------+
| Variant           | Default Background | Border         | Text Color | Hover State|
+-------------------+--------------------+----------------+------------+------------+
| Primary Brand     | #E0183D            | None           | #FFFFFF    | #C01333    |
| Secondary Outline | #FFFFFF            | 1px #CBD5E1    | #0F172A    | #F8FAFC    |
| WhatsApp CTA      | #25D366            | None           | #FFFFFF    | #1EBE5D    |
| Ghost / Subtle    | Transparent        | None           | #475569    | #F1F5F9    |
| Danger / Delete   | #DC2626            | None           | #FFFFFF    | #B91C1C    |
+-----------------------------------------------------------------------------------+
```

#### Button Implementation Guidelines:
* **Single-Line Label Rule:** Button labels must never wrap or truncate. Always apply `whitespace-nowrap shrink-0`.
* **Transitions:** Standard timing `transition-all duration-200 ease-in-out`.
* **Touch Target:** Minimum height of `44px` on mobile screens (`min-h-[44px]`).

### 6.2 Product Card Anatomy

```
+-------------------------------------------------------------+
|  +-------------------------------------------------------+  |  ◄── Outer Container
|  | [Bestseller Badge]                [Featured Star]    |  |      (rounded-2xl, bg-white,
|  |                                                       |  |       border border-slate-200)
|  |                   [Product Image]                     |  |
|  |                 (High-Res Switch View)                |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  FALCON 10A 1-WAY MODULAR SWITCH                            |  ◄── Title (text-slate-900, font-semibold)
|  SKU: FAL-MOD-101  •  Modular Switches                      |  ◄── SKU & Category (text-slate-500, font-mono)
|                                                             |
|  [ 10A 240V~ ]  [ 1 Module ]  [ FR Grade PC ]               |  ◄── Spec Chips (bg-slate-100, text-xs)
|                                                             |
|  ₹ 68.00  (Wholesale MOQ: 100 pcs)                          |  ◄── Pricing & MOQ Row
|                                                             |
|  +-----------------------------+ +-----------------------+  |  ◄── Action Buttons
|  |   💬 WhatsApp Inquiry       | |   📄 View Specs       |  |      (min-h-[42px], rounded-xl)
|  +-----------------------------+ +-----------------------+  |
+-------------------------------------------------------------+
```

### 6.3 Category Filter Carousel
* **Active State:** Solid primary red `#E0183D` with white text and active shadow.
* **Inactive State:** White background with 1px slate-200 border, slate-700 text, and subtle hover tint.
* **Auto-Scroll Behavior:** Pauses on mouse enter or touch start; resumes smoothly after 2 seconds.

### 6.4 Form Inputs & Search Fields
* **Default State:** `bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400`.
* **Focus State:** `ring-2 ring-[#E0183D]/20 border-[#E0183D] outline-none transition-all`.
* **Error State:** `border-red-500 ring-2 ring-red-500/20 text-red-900`.

---

## 7. Modal & Drawer Architecture

### 7.1 Backdrop & Transition
* **Backdrop:** `bg-black/60 backdrop-blur-sm fixed inset-0 z-50 animate-fade-in`.
* **Mobile Presentation:** Slides up smoothly from bottom (`rounded-t-3xl max-h-[90vh] overflow-y-auto`).
* **Desktop Presentation:** Centered dialog (`max-w-2xl lg:max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-8`).

### 7.2 Modal Rules
* Every modal MUST feature an unambiguous, high-contrast close button (`X` icon in top-right corner with 44px touch zone).
* Must support closing on backdrop tap and pressing the `Escape` key.

---

## 8. Anti-Pattern & "Anti-Slop" Quality Rules

To maintain high visual quality, the codebase enforces the following **banned UI patterns**:

1. ❌ **NO Arbitrary Gradients:** Do NOT use purple-to-blue gradients, gradient text clipping (`bg-clip-text text-transparent`), or neon glowing drop-shadows.
2. ❌ **NO Nested Card Confusion:** Never place a standard card inside another card with identical border and shadow styling. Use whitespace and dividers instead.
3. ❌ **NO Low Contrast Gray Text:** Never render gray text on colored backgrounds. All text must pass WCAG AA 4.5:1.
4. ❌ **NO Broken Badge Text:** Never allow text inside a badge or pill to wrap onto two lines.
5. ❌ **NO Fake Placeholder Buttons:** Every button and trigger must have an active, complete event handler (WhatsApp link, Modal trigger, Filter dispatch, Dialer link).

---
*Falcon Electricals Design System — Engineered for Clarity, Precision & Industrial Excellence.*
