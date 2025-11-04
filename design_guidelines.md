# Design Guidelines: GeoJSON Editor Web Application

## Design Approach

**Selected Approach:** Design System (Material Design) with reference to professional GIS tools like Mapbox Studio, geojson.io, and Figma's interface patterns.

**Rationale:** This is a utility-focused productivity tool requiring efficiency, clarity, and functional excellence. The interface prioritizes data manipulation, code editing, and map interaction over aesthetic appeal.

**Core Principles:**
- Functional clarity over decoration
- Information density with clear hierarchy
- Professional, technical aesthetic
- Immediate tool accessibility
- Zero distractions from core workflow

---

## Typography System

**Primary Font:** Inter (via Google Fonts CDN)
- Modern, technical, highly legible at small sizes
- Excellent number/code readability

**Secondary Font (Code):** JetBrains Mono (via Google Fonts CDN)
- Monospaced for code editor
- Clear character distinction

**Type Scale:**
- **Tool Labels/Small UI:** 12px, font-medium (500)
- **Body/Properties:** 14px, font-normal (400)
- **Section Headers:** 16px, font-semibold (600)
- **Panel Titles:** 18px, font-semibold (600)
- **Code Editor:** 13px, font-normal (400), monospace

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 1, 2, 3, 4, 6, 8, 12
- Tight spacing: p-1, p-2, gap-2 (controls, buttons)
- Standard spacing: p-4, gap-4 (sections, cards)
- Generous spacing: p-6, p-8 (panels, major sections)

**Core Layout Structure:**

**Application Shell:**
- Fixed header: h-12 with toolbar controls
- Main content area: Flexbox split-panel (50/50 default, resizable)
- No footer (maximizes work area)
- Panels use flex-1 with min-width constraints

**Panel Configuration:**
- Left Panel: Interactive map (Leaflet canvas)
- Right Panel: Tabbed interface (Code Editor, Table View, Properties)
- Divider: 4px draggable resize handle between panels

**Responsive Breakpoints:**
- Desktop (>1024px): Side-by-side panels
- Tablet (768-1024px): Collapsible panels with toggle
- Mobile (<768px): Stacked view with tab switching

---

## Component Library

### Navigation & Controls

**Top Toolbar:**
- Full-width fixed header (h-12)
- Left section: Logo/title + primary actions (New, Open, Save)
- Center section: Drawing tools (Point, Line, Polygon, Rectangle, Circle)
- Right section: View controls (Zoom, Layers, Export, Settings)
- Icons: Heroicons (outline style, size 20px)
- Button groups separated by vertical dividers (h-6, w-px)

**Drawing Toolbar (Map Panel):**
- Floating vertical toolbar on map (left side, 16px from edge)
- Tool buttons in vertical stack (w-10, h-10 each, gap-1)
- Active tool indicated with distinct visual state
- Tooltips on hover (positioned right of toolbar)

**Code Editor Toolbar:**
- Horizontal toolbar above editor (h-10)
- Format options: GeoJSON, TopoJSON, CSV, KML, WKT
- Action buttons: Format, Validate, Copy
- Status indicator: Valid/Invalid with count

### Map Interface

**Map Container:**
- Full panel coverage with Leaflet integration
- Base layer switcher (top-right corner, compact dropdown)
- Zoom controls (bottom-right, stacked +/- buttons)
- Scale indicator (bottom-left)
- Attribution (bottom-right, minimal text-xs)

**Map Controls Styling:**
- Rounded-md shadow-lg
- Compact button groups
- Clear active states for selected layers/tools

### Code Editor

**Editor Panel:**
- Monaco Editor or CodeMirror integration
- Syntax highlighting for JSON
- Line numbers (40px gutter width)
- Bracket matching and auto-formatting
- Scrollbar always visible (8px width)

**Editor Features:**
- Tab bar if multiple formats loaded (h-10)
- Line/column indicator (bottom-right)
- Error annotations inline with squiggly underlines

### Data Table View

**Table Structure:**
- Fixed header row (h-10)
- Alternating row treatment for readability
- Column headers: sortable with arrow indicators
- Cell padding: px-3, py-2
- Horizontal scrolling for wide datasets

**Table Features:**
- Add/delete row buttons (top-right of table)
- Inline editing (double-click cells)
- Column resize handles
- Checkbox selection (leftmost column, w-10)

### Property Editor

**Properties Panel:**
- Accordion-style sections for each feature
- Feature list (left sidebar, w-48)
- Property details (main area)
- Form fields: standardized input heights (h-9)

**Form Controls:**
- Label-above-input pattern
- Input fields: rounded-md border
- Spacing between fields: gap-4
- Add/remove property buttons (icon-only, w-8, h-8)

### Modals & Overlays

**Import/Export Dialog:**
- Centered modal (max-w-2xl)
- Clear header (h-16) with title and close button
- Content area (p-6)
- Footer with action buttons (h-16, right-aligned)

**File Drop Zone:**
- Dashed border on drag-over state
- Icon + instructional text centered
- Min-height: 200px

**Settings Panel:**
- Slide-out from right (w-80)
- Grouped options with section headers
- Toggle switches for boolean settings
- Select dropdowns for enumerations

### Buttons & Interactions

**Primary Actions:**
- Height: h-9
- Padding: px-4
- Rounded: rounded-md
- Font: font-medium, text-sm

**Icon Buttons:**
- Square: w-9, h-9
- Rounded: rounded-md
- Icon size: 20px

**Button Groups:**
- No gap between buttons
- First: rounded-l-md
- Last: rounded-r-md
- Middle: rounded-none

**Tool Palette Buttons:**
- Square: w-10, h-10
- Icons: 24px
- Clear selected state (distinct from hover)

---

## Animations

**Use Sparingly:**
- Panel resize: smooth transition (150ms)
- Modal fade-in: 200ms ease
- Dropdown menus: 150ms ease
- NO map animations (performance-critical)
- NO decorative effects

---

## Accessibility

**Keyboard Navigation:**
- All tools accessible via keyboard shortcuts
- Tab order: toolbar → map → editor → properties
- Focus indicators: 2px outline offset 2px
- Escape key closes modals/dropdowns

**ARIA Labels:**
- All icon buttons labeled
- Map region properly announced
- Editor region labeled as code editor
- Table rows/cells with proper roles

**Screen Reader Support:**
- Feature count announcements
- Validation error announcements
- Drawing tool changes announced

---

## Icons

**Library:** Heroicons (via CDN)
**Style:** Outline for toolbar, Solid for active states
**Size:** 20px standard, 24px for drawing tools

**Key Icons:**
- Map tools: MapIcon, PencilIcon, CursorArrowRaysIcon
- Actions: PlusIcon, TrashIcon, ArrowDownTrayIcon
- Format: DocumentTextIcon, TableCellsIcon, Cog6ToothIcon

---

## Images

**No Hero Images:** This is a productivity tool, not a marketing page.

**Icon Assets Only:**
- Favicon: Simple geometric GeoJSON logo
- Loading state: Minimal spinner
- Empty states: Simple illustration with instructional text

**Map Tiles:** Loaded from Leaflet tile providers (OSM, satellite options)

---

## Critical Quality Standards

- **Information Density:** Every pixel serves the workflow - no wasted space
- **Tool Discoverability:** All features accessible within 2 clicks
- **Performance:** Instant UI response, optimized map rendering
- **Professional Aesthetic:** Clean, technical, credible for GIS professionals
- **Offline Resilience:** All UI assets bundled, works without internet after initial load