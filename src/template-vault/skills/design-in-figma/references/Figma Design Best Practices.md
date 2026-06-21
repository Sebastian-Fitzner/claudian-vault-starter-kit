-----

## title: Figma Design Best Practices
type: reference
scope: design
tools: [figma-mcp]
description: craft and operating rules for building and styling designs natively inside Figma via the Figma MCP server. referenced by the design-in-figma implementation skill. covers auto layout, constraints, alignment, variables/tokens, components, naming, file structure, MCP operating rules, responsive design, and accessibility. this note is the source of truth for HOW to build in Figma; the skill owns the WHEN and the workflow gate.

# Figma Design Best Practices

Source of truth for **how** to build and style natively in Figma. The [[skills/design-in-figma/SKILL|design-in-figma]] skill owns the workflow gate, timeline, and persona handling; this note owns the craft and the Figma MCP operating rules. Keep the two decoupled — scale or correct this note without touching the skill.

Deliverable is always the **Figma design itself** (editable, design-system-linked nodes), never generated code.

## Core principles

- reuse before redraw — never draw a primitive when a published component exists
- tokens before hardcoded values — never hardcode a hex or pixel value when a variable/style exists
- auto layout by default — constraints only where auto layout cannot reach
- semantic tokens, not primitives, on components — so a mode switch re-themes everything
- minimal variants — prefer boolean / text / instance-swap / slots over variant explosion
- validate after every step — never trust a build without a screenshot

## Auto layout

- apply auto layout to anything content-driven: buttons, lists, cards, nav, whole screens
- auto layout controls how a frame responds to changing content; constraints control how objects respond to a changing frame
- flows: `layoutMode = "HORIZONTAL" | "VERTICAL" | "NONE"`; wrap via `layoutWrap = "WRAP" | "NO_WRAP"`; Grid is the 2D flow (use for dashboards/galleries/bento)
- spacing: `itemSpacing` (gap), `counterAxisSpacing` (row gap when wrapping)
- padding: `paddingTop` / `paddingBottom` / `paddingLeft` / `paddingRight`
- main-axis align: `primaryAxisAlignItems = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"`
- cross-axis align: `counterAxisAlignItems = "MIN" | "CENTER" | "MAX" | "BASELINE"` — does NOT support `STRETCH`; to stretch a child, append it then set its cross-axis sizing to `FILL`

### Hug / Fill / Fixed mental model

- **Hug** (`layoutSizingHorizontal/Vertical = "HUG"`): shrink to content — buttons, chips, tags
- **Fill** (`"FILL"`): stretch to parent — inputs, spanning text, flexible columns
- **Fixed** (`"FIXED"`): hold a set dimension regardless of content
- container hug = `primaryAxisSizingMode`/`counterAxisSizingMode = "AUTO"`; fixed = `"FIXED"`

### Critical ordering rules (Plugin API)

- set `FILL` (and `HUG` on non-auto-layout nodes) **after** `parent.appendChild(child)` — setting before append throws
- `resize(w, h)` silently resets both sizing modes to FIXED — call `resize()` first, then set sizing modes
- a HUG parent collapses FILL children to minimum — parent must be FIXED or FILL for a FILL child to expand (a common truncated-text cause)

### Min / max and absolute positioning

- bind min/max width/height to number variables for resilient buttons (min-width so localized labels don’t shrink) and text (max-width for readable line length)
- setting min/max width on an auto-layout frame disables left+right and scale constraints
- Grid flow does not yet support hug or min/max on tracks — fall back to nested horizontal/vertical auto layout with wrap when you need those
- absolute positioning (now “Ignore auto layout”): `child.layoutPositioning = "ABSOLUTE"`, then set `constraints` and `x/y` — use sparingly for badges/overlays only; Figma sometimes auto-applies it, so verify and remove unintended cases

### Common mistakes

- redundant nested frames; fixed-size text boxes inside fluid frames (prefer auto-width/height text); forgetting to set child resizing; testing behavior on a main component instead of an instance

## Constraints

- apply only to objects in non-auto-layout frames or objects that ignore auto layout
- `constraints = { horizontal: "LEFT"|"RIGHT"|"CENTER"|"LEFT_RIGHT"|"SCALE", vertical: "TOP"|"BOTTOM"|"CENTER"|"TOP_BOTTOM"|"SCALE" }`
- Left/Top hold position; Left+Right / Top+Bottom grow with the frame; Center stays centered; Scale resizes proportionally
- rule of thumb: auto layout wherever possible, constraints only where needed

## Alignment & distribution

- in auto layout, alignment is `primaryAxisAlignItems`/`counterAxisAlignItems`; even distribution is `SPACE_BETWEEN`
- prefer constructing auto-layout frames explicitly over relying on the “Suggest auto layout” engine when building programmatically

## Variables, tokens & styles

Four variable types: Color, Number (FLOAT), String, Boolean. **Collections** group variables and hold **modes**; modes store one value per variable per context (Light/Dark, density, breakpoint, platform, language).

### Token architecture (layered)

1. **Primitives** collection — raw values (`blue-500`, `space-4`); reference-only; hide from publishing; scopes `[]`
1. **Semantic / Tokens** collection — intent aliases (`surface/brand`, `text/primary`, `border/default`); reference primitives; hold Light/Dark (and density/breakpoint) modes; this is what designs apply
1. **Component tokens** (optional, enterprise scale only) — e.g. `button-primary-background-default`

The semantic layer is what makes a mode switch re-theme everything. Bind components to semantic tokens, never to primitives.

### Variables vs styles

- variables → single values that change by mode (color, spacing, radius, type numbers)
- styles → composites that can’t be one variable: **text styles** (family/size/weight/line-height/spacing) and **effect styles** (shadows/blurs; shadows must be effect styles, not variables)

### Binding & scoping

- bind number variables to gap (`itemSpacing`, `counterAxisSpacing`), padding, and individual corner radii (`topLeftRadius` etc., not `cornerRadius`)
- color variables bind to fills/strokes; `fontSize`/`fontWeight`/`lineHeight` are NOT bindable via `setBoundVariable` — set directly
- always set `variable.scopes` explicitly — never leave `["ALL_SCOPES"]`. Use `["FRAME_FILL","SHAPE_FILL"]`, `["TEXT_FILL"]`, `["STROKE_COLOR"]`, `["GAP"]`, `["CORNER_RADIUS"]`, `[]` (hide primitives)
- set `setVariableCodeSyntax('WEB'/'ANDROID'/'iOS', ...)` to align names with code
- `setBoundVariable` / `setBoundVariableForPaint` return new objects — reassign them

## Components

- create with `figma.createComponent()`; combine with `figma.combineAsVariants([components], parent)` (pass ComponentNodes, not frames; there is no `createComponentSet`)
- after combining, children stack at (0,0) — reposition and `resizeWithoutConstraints()` from real bounds
- variant name format: `Property=Value, Property=Value` (e.g. `size=md, style=primary`)

### Property types & decision rule

- `VARIANT` — state/size differences that change layout, color, or structure
- `BOOLEAN` — toggle layer visibility (optional icon)
- `TEXT` — editable labels
- `INSTANCE_SWAP` — swap a nested component (one swap property instead of dozens of icon variants)
- reserve variants for layout/color/border changes; use boolean/text/swap for the rest. Double-digit variant counts mean you need booleans, nested instances, or variables. For multi-brand/theme use modes, not variants
- `addComponentProperty(name, type, default)` returns an unpredictable string key (e.g. `"label#4:0"`) — never hardcode it; link via `node.componentPropertyReferences = { characters: key }` / `{ visible: key }` / `{ mainComponent: key }`. Add properties to each variant **before** `combineAsVariants`

### Slots vs base components

- use **slots** (GA, support min/max layer counts and empty-slot defaults) for flexible/repeating content (modals, cards, lists) without detaching
- instance-swap hard-locks one nested component in a fixed position; slots are open containers — pick by how much composition freedom the consumer should have
- prefer flat variant sets + multi-edit + nested instances over deep base-component inheritance (reduces file bloat, isolates updates, preserves overrides)

## Naming & layer hygiene

- name layers by purpose, not appearance (`CTA Button`, not `Rectangle 23`)
- use frames over groups (frames support constraints, auto layout, clipping, masking)
- name variables/tokens by role (`text/secondary`), not value (`gray-text`); match code token names where possible
- slash-separated component names create Assets-panel hierarchy (`Component/State`); leading `.`/`_` hides from publishing
- add a description to every main component
- variant property values in Title/PascalCase, consistent property sets across the set

## File & page structure

- cover page first (set as thumbnail): file name, status, owner, spec links
- pages separate phases/platforms — common set: Cover, Getting Started, Foundations, Components, WIP, Ready for Dev, Archive
- sections group related frames within a page; sections don’t auto-resize via the API — `resizeWithoutConstraints()` after adding content
- keep the design-system/library file separate from product files; keep approved work apart from WIP

## Figma MCP operating rules

Pair `use_figma` with the `figma-use` skill (mandatory) plus the relevant task skill (`figma-generate-design` for screens). Prefer the remote MCP server unless selection-based desktop prompting is needed.

### Workflow

1. understand the target — read the approved plan/spec; list sections and the components each needs
1. discover the design system first — inspect existing instances/bound variables/styles (authoritative), else `search_design_system` broadly (try synonyms; gray/grey, space/spacing). `getLocalVariableCollectionsAsync()` returns only local variables — never conclude “no variables exist” from it alone
1. create the page wrapper frame first, then build each section directly inside it (don’t build top-level and reparent — cross-call `appendChild` silently orphans frames). Build one section per `use_figma` call
1. reuse, don’t redraw — import by key (`importComponentSetByKeyAsync`), bind variables, apply text/effect styles, override instance text via `setProperties()` with discovered property keys (not raw `characters`)
1. validate after each section with `get_screenshot` (per-section, not just full-page) and `get_metadata`

### Plugin API rules (must obey)

- use `return` for output (auto-serialized); never `figma.closePlugin()`, `figma.notify()`, or `console.log()` for output; don’t wrap in an async IIFE
- colors are 0–1, not 0–255; paint color is `{r,g,b}` (opacity at paint level); COLOR variable values are `{r,g,b,a}`
- fills/strokes are read-only arrays — clone, modify, reassign
- load fonts before any text op: `await figma.loadFontAsync({family, style})`; discover exact style strings via `listAvailableFontsAsync()` (“SemiBold” ≠ “Semi Bold”); `lineHeight`/`letterSpacing` are `{value, unit}` objects
- switch pages with `await figma.setCurrentPageAsync(page)`; page context resets each call
- position new top-level nodes away from (0,0)
- scripts are atomic — on error STOP, read the message, fix, retry (nothing partial is created)
- return all created/mutated node IDs every call

### Known limitations (write-to-canvas beta)

- 20kb output response limit per call; no image/asset import yet; custom fonts not supported yet
- components must be manually published before Code Connect completes
- output is beta-level quality — treat agent builds as drafts that need designer QA
- requires a Full seat plus edit permission on the target file

## Responsive design

- combine auto layout (content-driven) + constraints (frame-driven) + min/max sizing + variable modes for breakpoints
- pattern: a collection with Mobile/Tablet/Desktop modes holding different number values; apply the mode at frame level (`setExplicitVariableModeForCollection`) so one layout re-flows
- FILL children for fluid columns; FIXED/min-width for elements that must not collapse; Grid flow for true 2D responsive layouts
- verify by resizing the frame before sign-off

## Accessibility

- contrast: AA 4.5:1 (normal text), 3:1 (large text/non-text), AAA 7:1 — use Figma’s Color Contrast Checker
- minimum touch target ≥ 44×44px (WCAG 2.5.5); flag text under 12px, warn under 16px; respect line-height (WCAG 1.4.12)
- annotate heading levels, landmarks, focus/tab order, ARIA labels, and alt text in-file; bake a11y metadata (min target, focus indicator, screen-reader label) into components so it travels with every instance

## Verification checklist (before handoff)

- resize frames to check reflow at each breakpoint
- per-section screenshots: no clipped text, no overlaps, no placeholder strings, correct variants
- `get_metadata` shows instances linked to main components
- no stray hex/pixel values — every value resolves to a token
- contrast AA, touch-target ≥ 44×44, heading order, alt text all pass
- naming and layer hygiene clean; mark “Ready for dev”
- fix issues with targeted scripts — never rebuild from scratch