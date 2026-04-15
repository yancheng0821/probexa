# Probexa UI Redesign — Design Spec

## Goal

Redesign the frontend from default Ant Design to a polished, production-grade dashboard with a "Soft & Rounded" visual language.

## Design Direction

**Style:** Soft & Rounded — inspired by Linear / Craft / Vercel
**Theme:** Light mode
**Sidebar:** Collapsible icon bar (56px collapsed, 220px expanded)
**Color:** Rich, colorful — each module has its own accent color

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366f1` (Indigo) | Sidebar active, primary buttons, main charts |
| Accent | `#8b5cf6` (Violet) | Secondary highlights, gradients |
| Success | `#10b981` (Emerald) | Completed status, rising trends, positive metrics |
| Warning | `#f97316` (Orange) | Running status, medium severity |
| Danger | `#f43f5e` (Rose) | Failed status, pain points, critical items |
| Info | `#3b82f6` (Blue) | Stable trends, informational tags |
| Page BG | `#f8f9fa` | Main content background |
| Card BG | `#ffffff` | Card surfaces |
| Text Primary | `#1a1a2e` | Headings, important numbers |
| Text Secondary | `#888888` | Labels, descriptions |
| Border | `#e8e8e8` | Subtle dividers |

### Typography

- Font Family: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
- Page Title: 18px, weight 600
- Card Title: 13-14px, weight 600
- Body: 12px, weight 400
- Label: 10-11px, weight 500, color #888
- Big Number: 20-24px, weight 700

### Spacing & Shapes

- Card Border Radius: 12px
- Button Border Radius: 8px
- Tag/Badge Border Radius: 20px (pill)
- Card Shadow: `0 1px 3px rgba(0,0,0,0.06)`
- Grid Gap: 12px (cards), 10px (items)
- Page Padding: 20-24px

### Sidebar

- **Collapsed:** 56px wide, white background, border-right 1px #e8e8e8
- **Expanded:** 220px wide, slide-out animation
- **Logo:** 32x32px gradient square (indigo→violet), border-radius 8px, letter "P"
- **Nav Items:** 36x36px icon buttons, active item has `background: #f0f0ff`, color indigo
- **Toggle:** Hover over sidebar to expand, or click hamburger

---

## Page Designs

### 1. Dashboard (/)

**Layout:** 4-column stat cards → 2-column (activity chart + platform breakdown)

**Stat Cards (4):**
- Total Tasks — number in indigo, green % change
- Items Scraped — number in violet, green % change
- Pain Points — number in rose, orange critical count
- Rising Trends — number in emerald, green new count

**Activity Chart:**
- 7-day bar chart with indigo→violet gradient bars
- Rounded bar tops (border-radius 4px)

**Platform Breakdown:**
- Colored dots (indigo/rose/orange/emerald) + platform name + percentage

### 2. Tasks (/tasks)

**Create Form:**
- White card, inline layout: keyword input + platform dropdown + max items input + "Start Scraping" button (indigo)
- Inputs: #f8f9fa background, 1px #e8e8e8 border, 8px radius

**Task Table:**
- White card, no outer border, subtle shadow
- Header row: uppercase 11px #888
- Platform: colored pill tag (TikTok=indigo, YouTube=rose, Reddit=orange, Amazon=emerald)
- Status: colored pill (Completed=green, Running=yellow, Failed=rose, Pending=blue)
- Actions: colored small tag buttons for each analysis type (Pain Points=yellow, Trends=blue, Needs=green, Pricing=violet)

### 3. Trends (/trends)

**Layout:** Overview card → Bar chart → 3-column trend cards

**Overview Card:** Summary text from latest analysis

**Bar Chart:**
- Indigo/violet gradient bars, rounded tops
- Topic labels below each bar, 9px

**Trend Cards (3 per row):**
- White cards with title + momentum tag (rising=green pill, stable=blue pill, declining=rose pill)
- Description text in #888
- Engagement score as large number in accent color

### 4. Pain Points (/pain-points)

**Layout:** Scatter plot → Detail table

**Scatter Plot:**
- Axes: Frequency (X) vs Severity (Y)
- Dots sized by impact (frequency × severity)
- Colors: rose (high), orange (medium), yellow (low), indigo (misc)

**Table:**
- Columns: Issue, Frequency, Severity (dot indicators), Sample Quote (italic, #888)
- Sortable by frequency and severity

### 5. Needs (/needs)

**Layout:** Vertical card list

**Need Cards:**
- Title + market potential pill tag (high=green, medium=orange, low=gray)
- "Mentioned N times" subtitle
- Sample quotes in italic #888

### 6. Schedules (/schedules)

**Layout:** "Add Schedule" button → Table

**Table:**
- Columns: Keyword, Platform (colored pill), Cron Expression, Active (toggle switch), Last Run, Actions (delete button)
- "Add Schedule" button: indigo, top-right

**Modal:** White card, vertical form with indigo submit button

### 7. Reports (/reports)

**Layout:** Task selector + Generate button → Report preview card

**Selector:** Dropdown with task keyword + platform label
**Preview:** White card with rendered markdown (pre-formatted, clean typography)

---

## Component Changes

### Remove
- Ant Design's default `<Layout>` / `<Sider>` / `<Header>` — replace with custom
- Ant Design's default theme colors — override with our palette

### Keep
- Ant Design `<Table>`, `<Form>`, `<Input>`, `<Select>`, `<Modal>`, `<Switch>`, `<message>` — but restyle via CSS/ConfigProvider
- Recharts for charts — update colors to match palette
- React Router structure unchanged

### Add
- Custom sidebar component with collapse/expand
- CSS variables for design tokens
- Global stylesheet override for Ant Design
- ConfigProvider theme customization

---

## Implementation Approach

Override Ant Design's theme using `ConfigProvider` with custom token values. Create a custom `Sidebar` component replacing the current `Sider`. Add a global CSS file with design tokens as CSS variables. Update all page components to use the new color scheme, card styles, and layout patterns.

No structural changes to routing or data fetching — purely visual layer changes.
