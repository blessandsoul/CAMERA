# /ui — Design Agent

You are now in **UI Design Mode** — a combined agent that uses both `interface-design` and `ui-ux-pro-max` skills simultaneously.

**Request:** $ARGUMENTS

---

## Phase 0: Read Project Design System

Before anything else, read `.claude/rules/client/04-design-system.md` to internalize the project's Neuro-Minimalism system (tokens, spacing, motion, typography). All output must stay within these constraints.

---

## Phase 1: Classify the Request

Determine which path applies:

| Request type | Path |
|---|---|
| Dashboard, admin panel, SaaS app, data interface, tool, settings | → **Interface Design path** |
| Landing page, marketing page, public-facing content | → **Landing/Marketing path** |
| Component, button, modal, form, card, navbar | → **Component path** |
| Review / audit / improve existing UI | → **Critique path** |

---

## Phase 2A: Interface Design Path (dashboards, apps, tools)

Follow the `interface-design` skill workflow:

### Step 1 — Intent (mandatory, state out loud)
Answer before touching code:
- **Who is this human?** (not "users" — the actual person, their context, their state of mind)
- **What must they accomplish?** (the specific verb: grade, approve, find, configure...)
- **How should this feel?** (not "clean and modern" — warm like a notebook? cold like a terminal? dense like a trading floor?)

### Step 2 — Domain Exploration (mandatory)
Produce ALL FOUR before proposing any direction:

1. **Domain** — 5+ concepts/metaphors/vocabulary from this product's world (not features — territory)
2. **Color world** — 5+ colors that exist naturally in this domain's physical world
3. **Signature** — one element (visual, structural, or interaction) that could ONLY exist for THIS product
4. **Defaults to reject** — 3 obvious choices for this interface type that you will NOT use

### Step 3 — Proposal
Must explicitly reference domain concepts, color world, signature, and what replaces each default.
Ask: "Does that direction feel right?"

### Step 4 — Build

Before writing each component, state:
```
Intent: [who, what, how it should feel]
Palette: [colors from exploration — WHY they fit]
Depth: [borders/shadows/layered — WHY this fits intent]
Surfaces: [elevation scale — WHY this color temperature]
Typography: [typeface — WHY it fits intent]
Spacing: [base unit]
```

Apply Craft Foundations:
- **Surface elevation** — whisper-quiet shifts (2-3% lightness). Sidebars = same bg as canvas + border. Inputs = slightly darker than surroundings.
- **Borders** — low opacity rgba, not solid hex. Build a progression (standard → softer → emphasis → focus ring).
- **No identical components** — hero number ≠ inline stat ≠ sparkline ≠ gauge. Each serves its data.
- **Navigation context** — every screen needs grounding. Include where-am-I, where-can-I-go.

---

## Phase 2B: Landing/Marketing Path

Run the `ui-ux-pro-max` design system workflow:

### Step 1 — Extract requirements
- Product type: SaaS / e-commerce / portfolio / beauty / fintech...
- Style keywords: minimal / playful / professional / elegant / dark mode...
- Industry context
- Stack: **nextjs** (this project)

### Step 2 — Generate Design System

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system --persist -p "Camera Project" --stack nextjs
```

This outputs: pattern, style, colors, typography, effects, anti-patterns.

### Step 3 — Supplement searches as needed

```bash
# More style options
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain style

# UX best practices
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain ux

# Typography
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain typography

# Landing structure
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain landing
```

### Step 4 — Build with project constraints
Apply output from design system within the Neuro-Minimalism tokens defined in `globals.css`.

---

## Phase 2C: Component Path

1. Read the existing component context (file if editing, description if new)
2. State intent (what this component does, who uses it, what it should feel like)
3. Pick a design direction (is this a card? what KIND of card — metric, plan, settings, status?)
4. Apply surface treatment consistent with existing components
5. Implement all states: default → hover → active → focus → disabled → loading → empty → error

---

## Phase 2D: Critique Path

Run the Craft Checks against the provided code/screenshot:

- **Swap test** — if you swapped typeface/layout for the most common alternatives, would it feel different?
- **Squint test** — blur your eyes. Is hierarchy still perceivable? Anything jumping out harshly?
- **Signature test** — can you point to 5 specific elements where a signature appears?
- **Token test** — do CSS variables sound like they belong to THIS product's world?
- **States test** — hover, focus, disabled, loading, empty, error — all present?

Then: identify what defaulted, propose alternatives rooted in the domain, rebuild what failed.

---

## Phase 3: Pre-Delivery Checklist

Run before showing ANY output:

### Visual Quality
- [ ] No emojis used as icons (SVG only — Lucide icons already in this project)
- [ ] Semantic color tokens only — NO `bg-blue-500`, NO `bg-[#3b82f6]`
- [ ] Hover states don't cause layout shift
- [ ] `cn()` for conditional classes, never inline styles

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states: visible color/shadow/scale change within 100ms
- [ ] Transitions: `transition-all duration-200 ease-out`
- [ ] Focus rings: `ring-2 ring-primary/50` on `:focus-visible` only

### Accessibility
- [ ] All images have alt text
- [ ] Icon-only buttons have `aria-label`
- [ ] One `h1` per page, no skipped heading levels
- [ ] Tab order is logical
- [ ] `motion-safe:` wrapper on all animations

### Layout
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] LCP image has `priority` prop (if applicable)
- [ ] Container: `container mx-auto px-4 md:px-6 lg:px-8`

### Component limits (project rules)
- [ ] Max 250 lines per component
- [ ] Max 5 props (group related into object if needed)
- [ ] Max 3 JSX nesting levels
- [ ] `'use client'` only if state/hooks/events required

---

## Phase 4: Offer to Save

After completing, ask:
> "Want me to save these patterns to `.interface-design/system.md` for future sessions?"

If yes, save: direction, depth strategy, spacing base unit, key component patterns.

---

## Rules That Never Break

1. **Never hardcode colors** — `bg-primary` not `bg-blue-500`
2. **Never inline styles** — Tailwind + `cn()` only
3. **Sameness is failure** — if another AI would produce the same output, iterate
4. **Every choice must be a choice** — if you can't say WHY, you defaulted
5. **Intent must be systemic** — stated "warm"? every token must be warm
