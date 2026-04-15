# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Probexa frontend from default Ant Design to a polished "Soft & Rounded" dashboard with collapsible sidebar, indigo palette, and colorful accents.

**Architecture:** Override Ant Design theme via ConfigProvider, replace Layout/Sider with a custom collapsible sidebar component, add global CSS variables for design tokens, and update all 7 page components with the new visual style. No structural/routing/data changes.

**Tech Stack:** React 18, Ant Design (ConfigProvider theming), Recharts (updated colors), CSS custom properties.

---

## File Structure

```
frontend/src/
├── theme/
│   └── theme.ts                 # CREATE — Ant Design ConfigProvider token overrides
├── styles/
│   └── global.css               # CREATE — CSS variables, global resets, custom styles
├── components/
│   ├── Sidebar.tsx              # CREATE — Custom collapsible sidebar
│   ├── Layout.tsx               # REWRITE — Use Sidebar + new header + ConfigProvider
│   ├── TaskForm.tsx             # MODIFY — Restyle inputs/button
│   ├── TaskList.tsx             # MODIFY — Colored pills, action tags
│   ├── TrendChart.tsx           # MODIFY — Gradient bars, indigo/violet palette
│   ├── PainPointMatrix.tsx      # MODIFY — Rose/orange/indigo dot colors
│   └── NeedsList.tsx            # MODIFY — Pill tags, card spacing
├── pages/
│   ├── Dashboard.tsx            # REWRITE — Stat cards + activity chart + platform breakdown
│   ├── Tasks.tsx                # MINOR — Already uses TaskForm/TaskList
│   ├── Trends.tsx               # REWRITE — Chart + trend cards grid
│   ├── PainPoints.tsx           # MODIFY — Updated table styling
│   ├── Needs.tsx                # MINOR — Already uses NeedsList
│   ├── Schedules.tsx            # MODIFY — Table pills + modal styling
│   └── Reports.tsx              # MODIFY — Card styling
├── main.tsx                     # MODIFY — Import global.css
├── App.tsx                      # NO CHANGE
├── App.css                      # DELETE — No longer needed
└── index.css                    # DELETE — Replaced by global.css
```

---

### Task 1: Design Tokens & Global Styles

**Files:**
- Create: `frontend/src/theme/theme.ts`
- Create: `frontend/src/styles/global.css`
- Modify: `frontend/src/main.tsx`
- Delete: `frontend/src/App.css`
- Delete: `frontend/src/index.css`

- [ ] **Step 1: Create theme.ts with Ant Design token overrides**

```typescript
// frontend/src/theme/theme.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f97316",
    colorError: "#f43f5e",
    colorInfo: "#3b82f6",
    borderRadius: 8,
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f8f9fa",
    colorBorder: "#e8e8e8",
    colorText: "#1a1a2e",
    colorTextSecondary: "#888888",
    fontSize: 13,
  },
  components: {
    Table: {
      borderRadius: 12,
      headerBg: "#ffffff",
      headerColor: "#888888",
      headerSplitColor: "transparent",
      rowHoverBg: "#f8f9fa",
    },
    Button: {
      borderRadius: 8,
      primaryShadow: "none",
    },
    Input: {
      borderRadius: 8,
      colorBgContainer: "#f8f9fa",
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Card: {
      borderRadius: 12,
    },
    Tag: {
      borderRadiusSM: 20,
    },
  },
};

export default theme;
```

- [ ] **Step 2: Create global.css**

```css
/* frontend/src/styles/global.css */
:root {
  --color-primary: #6366f1;
  --color-accent: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f97316;
  --color-danger: #f43f5e;
  --color-info: #3b82f6;
  --color-bg-page: #f8f9fa;
  --color-bg-card: #ffffff;
  --color-text: #1a1a2e;
  --color-text-secondary: #888888;
  --color-border: #e8e8e8;
  --radius-card: 12px;
  --radius-button: 8px;
  --radius-pill: 20px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
  --sidebar-collapsed: 56px;
  --sidebar-expanded: 220px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--color-bg-page);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

/* Stat card */
.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}

.stat-card .stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-card .stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 4px;
}

.stat-card .stat-change {
  font-size: 10px;
  margin-top: 4px;
}

/* Content card */
.content-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}

.content-card .card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
}

/* Platform pills */
.pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
}

.pill-tiktok { background: #f0f0ff; color: #6366f1; }
.pill-youtube { background: #fee2e2; color: #dc2626; }
.pill-reddit { background: #fff7ed; color: #ea580c; }
.pill-amazon { background: #d1fae5; color: #059669; }

/* Status pills */
.pill-completed { background: #dcfce7; color: #16a34a; }
.pill-running { background: #fef3c7; color: #d97706; }
.pill-pending { background: #dbeafe; color: #2563eb; }
.pill-failed { background: #fee2e2; color: #dc2626; }

/* Action tags */
.action-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-tag:hover { opacity: 0.8; }
.action-tag-pain { background: #fef3c7; color: #d97706; }
.action-tag-trends { background: #dbeafe; color: #2563eb; }
.action-tag-needs { background: #d1fae5; color: #059669; }
.action-tag-pricing { background: #ede9fe; color: #7c3aed; }

/* Momentum tags */
.momentum-rising { background: #dcfce7; color: #16a34a; }
.momentum-stable { background: #dbeafe; color: #2563eb; }
.momentum-declining { background: #fee2e2; color: #dc2626; }

/* Market potential tags */
.potential-high { background: #dcfce7; color: #16a34a; }
.potential-medium { background: #fef3c7; color: #d97706; }
.potential-low { background: #f3f4f6; color: #6b7280; }

/* Override Ant Design table to remove default borders */
.ant-table-wrapper .ant-table {
  border-radius: var(--radius-card) !important;
}

.ant-table-wrapper .ant-table-container {
  border-radius: var(--radius-card) !important;
}

/* Smooth scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
```

- [ ] **Step 3: Update main.tsx to import global.css**

```typescript
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Delete old CSS files**

```bash
rm frontend/src/App.css frontend/src/index.css
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/aisenyc/work/probexa/frontend && npm run build`
Expected: Build succeeds (may have warnings about unused imports from deleted CSS).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/theme/ frontend/src/styles/ frontend/src/main.tsx
git rm frontend/src/App.css frontend/src/index.css
git commit -m "feat: add design tokens, global CSS, and Ant Design theme overrides"
```

---

### Task 2: Custom Sidebar Component

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar component**

```tsx
// frontend/src/components/Sidebar.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  SearchOutlined,
  RiseOutlined,
  WarningOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const navItems = [
  { path: "/", icon: <BarChartOutlined />, label: "Dashboard" },
  { path: "/tasks", icon: <SearchOutlined />, label: "Tasks" },
  { path: "/trends", icon: <RiseOutlined />, label: "Trends" },
  { path: "/pain-points", icon: <WarningOutlined />, label: "Pain Points" },
  { path: "/needs", icon: <BulbOutlined />, label: "Needs" },
  { path: "/schedules", icon: <ClockCircleOutlined />, label: "Schedules" },
  { path: "/reports", icon: <FileTextOutlined />, label: "Reports" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const width = collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-expanded)";

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: "100vh",
        background: "var(--color-bg-card)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease, min-width 0.2s ease",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "16px 12px" : "16px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          P
        </div>
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)" }}>
            Probexa
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px 12px" : "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: active ? "#f0f0ff" : "transparent",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontSize: 20,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div
        style={{ padding: "12px 8px", borderTop: "1px solid var(--color-border)" }}
      >
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            fontSize: 18,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span style={{ fontSize: 13 }}>Collapse</span>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: add custom collapsible sidebar component"
```

---

### Task 3: Rewrite Layout Component

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: Rewrite Layout.tsx**

```tsx
// frontend/src/components/Layout.tsx
import { ConfigProvider } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import theme from "../theme/theme";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/trends": "Trends",
  "/pain-points": "Pain Points",
  "/needs": "Needs",
  "/schedules": "Schedules",
  "/reports": "Reports",
};

const pageSubtitles: Record<string, string> = {
  "/": "Research overview and insights",
  "/tasks": "Create and manage scraping tasks",
  "/trends": "Rising topics and engagement patterns",
  "/pain-points": "Frequency and severity analysis",
  "/needs": "Unmet needs and market opportunities",
  "/schedules": "Automated scraping schedules",
  "/reports": "Generate and export reports",
};

export default function Layout() {
  const location = useLocation();

  return (
    <ConfigProvider theme={theme}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <header
            style={{
              padding: "20px 28px 0",
              background: "var(--color-bg-page)",
            }}
          >
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {pageTitles[location.pathname] || "Probexa"}
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {pageSubtitles[location.pathname] || ""}
            </p>
          </header>

          {/* Content */}
          <main style={{ flex: 1, padding: "16px 28px 28px" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/aisenyc/work/probexa/frontend && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat: rewrite Layout with custom sidebar and ConfigProvider theming"
```

---

### Task 4: Redesign Dashboard Page

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Rewrite Dashboard.tsx**

```tsx
// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: "pill-pending",
  running: "pill-running",
  completed: "pill-completed",
  failed: "pill-failed",
};

const platformColor: Record<string, string> = {
  tiktok: "pill-tiktok",
  youtube: "pill-youtube",
  reddit: "pill-reddit",
  amazon: "pill-amazon",
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks?limit=10").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalItems = tasks.reduce((sum, t) => sum + t.total_items, 0);
  const runningCount = tasks.filter((t) => t.status === "running").length;

  const stats = [
    { label: "Total Tasks", value: tasks.length, color: "var(--color-primary)", change: `${completedCount} completed` },
    { label: "Items Scraped", value: totalItems.toLocaleString(), color: "var(--color-accent)", change: `${runningCount} running` },
    { label: "Pain Points", value: "—", color: "var(--color-danger)", change: "Run analysis" },
    { label: "Rising Trends", value: "—", color: "var(--color-success)", change: "Run analysis" },
  ];

  // Mock weekly data for chart
  const chartData = [
    { day: "Mon", items: 120 },
    { day: "Tue", items: 230 },
    { day: "Wed", items: 180 },
    { day: "Thu", items: 340 },
    { day: "Fri", items: 280 },
    { day: "Sat", items: 150 },
    { day: "Sun", items: totalItems || 200 },
  ];

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      title: "Platform", dataIndex: "platform", key: "platform",
      render: (v: string) => <span className={`pill ${platformColor[v] || ""}`}>{v}</span>,
    },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (v: string) => <span className={`pill ${statusColor[v] || ""}`}>{v}</span>,
    },
    { title: "Items", dataIndex: "total_items", key: "total_items", render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span> },
  ];

  return (
    <>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-change" style={{ color: "var(--color-success)" }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="content-card">
          <div className="card-title">Scraping Activity (7 days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
              </defs>
              <Bar dataKey="items" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="content-card">
          <div className="card-title">By Platform</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {[
              { name: "TikTok", color: "#6366f1", pct: 68 },
              { name: "YouTube", color: "#f43f5e", pct: 18 },
              { name: "Reddit", color: "#f97316", pct: 10 },
              { name: "Amazon", color: "#10b981", pct: 4 },
            ].map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: p.color, borderRadius: "50%", display: "inline-block" }} />
                    {p.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.pct}%</span>
                </div>
                <div style={{ width: "100%", height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                  <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="content-card">
        <div className="card-title">Recent Tasks</div>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: redesign Dashboard with stat cards, gradient chart, platform breakdown"
```

---

### Task 5: Redesign TaskForm & TaskList Components

**Files:**
- Modify: `frontend/src/components/TaskForm.tsx`
- Modify: `frontend/src/components/TaskList.tsx`

- [ ] **Step 1: Rewrite TaskForm.tsx**

```tsx
// frontend/src/components/TaskForm.tsx
import { Form, Input, Select, InputNumber, Button, message } from "antd";
import api from "../api/client";

interface Props {
  onCreated: () => void;
}

export default function TaskForm({ onCreated }: Props) {
  const [form] = Form.useForm();

  const onFinish = async (values: { keyword: string; platform: string; max_items: number }) => {
    try {
      await api.post("/tasks", values);
      message.success("Task created");
      form.resetFields();
      onCreated();
    } catch {
      message.error("Failed to create task");
    }
  };

  return (
    <div className="content-card" style={{ marginBottom: 20 }}>
      <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ platform: "tiktok", max_items: 500 }} style={{ gap: 8 }}>
        <Form.Item name="keyword" rules={[{ required: true, message: "Enter keyword" }]} style={{ flex: 2 }}>
          <Input placeholder="Search keyword..." />
        </Form.Item>
        <Form.Item name="platform" style={{ flex: 1 }}>
          <Select>
            <Select.Option value="tiktok">TikTok</Select.Option>
            <Select.Option value="youtube">YouTube</Select.Option>
            <Select.Option value="reddit">Reddit</Select.Option>
            <Select.Option value="amazon">Amazon</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="max_items" style={{ flex: 1 }}>
          <InputNumber min={10} max={10000} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Start Scraping
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite TaskList.tsx**

```tsx
// frontend/src/components/TaskList.tsx
import { Table, Space, message } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

interface Props {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

const platformPill: Record<string, string> = {
  tiktok: "pill-tiktok",
  youtube: "pill-youtube",
  reddit: "pill-reddit",
  amazon: "pill-amazon",
};

const statusPill: Record<string, string> = {
  pending: "pill-pending",
  running: "pill-running",
  completed: "pill-completed",
  failed: "pill-failed",
};

export default function TaskList({ tasks, loading }: Props) {
  const triggerAnalysis = async (taskId: string, type: string) => {
    try {
      await api.post("/analysis", { task_id: taskId, analysis_type: type });
      message.success(`${type} analysis started`);
    } catch {
      message.error("Failed to start analysis");
    }
  };

  const columns = [
    {
      title: "Keyword", dataIndex: "keyword", key: "keyword",
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Platform", dataIndex: "platform", key: "platform",
      render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span>,
    },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (v: string) => <span className={`pill ${statusPill[v] || ""}`}>{v}</span>,
    },
    {
      title: "Items", dataIndex: "total_items", key: "total_items",
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>,
    },
    {
      title: "Actions", key: "actions",
      render: (_: unknown, record: Task) => (
        <Space size={4}>
          {record.status === "completed" && (
            <>
              <span className="action-tag action-tag-pain" onClick={() => triggerAnalysis(record.id, "pain_points")}>Pain Points</span>
              <span className="action-tag action-tag-trends" onClick={() => triggerAnalysis(record.id, "trends")}>Trends</span>
              <span className="action-tag action-tag-needs" onClick={() => triggerAnalysis(record.id, "unmet_needs")}>Needs</span>
              <span className="action-tag action-tag-pricing" onClick={() => triggerAnalysis(record.id, "pricing")}>Pricing</span>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="content-card">
      <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} size="small" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TaskForm.tsx frontend/src/components/TaskList.tsx
git commit -m "feat: redesign TaskForm and TaskList with pills and action tags"
```

---

### Task 6: Redesign Trends Page & Chart

**Files:**
- Modify: `frontend/src/components/TrendChart.tsx`
- Modify: `frontend/src/pages/Trends.tsx`

- [ ] **Step 1: Rewrite TrendChart.tsx**

```tsx
// frontend/src/components/TrendChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Trend {
  topic: string;
  engagement_score: number;
}

interface Props {
  trends: Trend[];
}

export default function TrendChart({ trends }: Props) {
  const data = trends.map((t) => ({
    name: t.topic.length > 15 ? t.topic.substring(0, 15) + "…" : t.topic,
    score: t.engagement_score,
    fullName: t.topic,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
          formatter={(value: number) => [value, "Score"]}
          labelFormatter={(_: string, payload: Array<{ payload: { fullName: string } }>) => payload[0]?.payload?.fullName || ""}
        />
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>
        <Bar dataKey="score" fill="url(#trendGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Rewrite Trends.tsx**

```tsx
// frontend/src/pages/Trends.tsx
import { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
import TrendChart from "../components/TrendChart";
import api from "../api/client";

interface TrendResult {
  id: string;
  summary: string;
  details: {
    trends?: Array<{
      topic: string;
      momentum: string;
      engagement_score: number;
      evidence?: string[];
    }>;
  };
}

const momentumClass: Record<string, string> = {
  rising: "momentum-rising",
  stable: "momentum-stable",
  declining: "momentum-declining",
};

const scoreColor = (score: number) => {
  if (score >= 85) return "var(--color-primary)";
  if (score >= 70) return "var(--color-accent)";
  return "var(--color-info)";
};

export default function Trends() {
  const [results, setResults] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/trends").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No trend data yet. Run a scrape task and trigger trends analysis." />;

  const latest = results[0];
  const trends = latest.details.trends || [];

  return (
    <>
      {/* Summary */}
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Summary</div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{latest.summary}</p>
      </div>

      {/* Chart */}
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Engagement Scores</div>
        <TrendChart trends={trends} />
      </div>

      {/* Trend Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {trends.map((t, i) => (
          <div key={i} className="content-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{t.topic}</span>
              <span className={`pill ${momentumClass[t.momentum] || ""}`}>
                {t.momentum === "rising" ? "↑" : t.momentum === "declining" ? "↓" : "—"} {t.momentum}
              </span>
            </div>
            {t.evidence?.map((e, j) => (
              <p key={j} style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{e}</p>
            ))}
            <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(t.engagement_score), marginTop: 8 }}>
              {t.engagement_score}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TrendChart.tsx frontend/src/pages/Trends.tsx
git commit -m "feat: redesign Trends page with gradient chart and trend cards"
```

---

### Task 7: Redesign Pain Points Page & Matrix

**Files:**
- Modify: `frontend/src/components/PainPointMatrix.tsx`
- Modify: `frontend/src/pages/PainPoints.tsx`

- [ ] **Step 1: Rewrite PainPointMatrix.tsx**

```tsx
// frontend/src/components/PainPointMatrix.tsx
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface PainPoint {
  issue: string;
  frequency: number;
  severity: number;
}

interface Props {
  painPoints: PainPoint[];
}

export default function PainPointMatrix({ painPoints }: Props) {
  const data = painPoints.map((p) => ({
    x: p.frequency,
    y: p.severity,
    z: p.frequency * p.severity,
    name: p.issue,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" dataKey="x" name="Frequency" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} label={{ value: "Frequency →", position: "bottom", fontSize: 11, fill: "#888" }} />
        <YAxis type="number" dataKey="y" name="Severity" domain={[0, 10]} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} label={{ value: "Severity →", angle: -90, position: "insideLeft", fontSize: 11, fill: "#888" }} />
        <ZAxis type="number" dataKey="z" range={[80, 600]} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>Frequency: {d.x} · Severity: {d.y}</div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#f43f5e" fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Rewrite PainPoints.tsx**

```tsx
// frontend/src/pages/PainPoints.tsx
import { useEffect, useState } from "react";
import { Empty, Spin, Table } from "antd";
import PainPointMatrix from "../components/PainPointMatrix";
import api from "../api/client";

interface PainPointResult {
  id: string;
  summary: string;
  details: {
    pain_points?: Array<{
      issue: string;
      frequency: number;
      severity: number;
      sample_quotes?: string[];
    }>;
  };
}

export default function PainPoints() {
  const [results, setResults] = useState<PainPointResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/pain-points").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No pain point data yet." />;

  const latest = results[0];
  const points = latest.details.pain_points || [];

  const severityDots = (n: number) => {
    const filled = Math.round(n / 2.5);
    return "●".repeat(filled) + "○".repeat(4 - filled);
  };

  const columns = [
    { title: "Issue", dataIndex: "issue", key: "issue", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      title: "Frequency", dataIndex: "frequency", key: "frequency",
      sorter: (a: { frequency: number }, b: { frequency: number }) => a.frequency - b.frequency,
      render: (v: number) => <span style={{ fontWeight: 700, color: v > 30 ? "var(--color-danger)" : v > 15 ? "var(--color-warning)" : "var(--color-text)" }}>{v}</span>,
    },
    {
      title: "Severity", dataIndex: "severity", key: "severity",
      sorter: (a: { severity: number }, b: { severity: number }) => a.severity - b.severity,
      render: (v: number) => <span style={{ color: v >= 7 ? "var(--color-danger)" : "var(--color-warning)", letterSpacing: 2 }}>{severityDots(v)}</span>,
    },
    {
      title: "Sample Quotes", dataIndex: "sample_quotes", key: "sample_quotes",
      render: (quotes: string[]) => (
        <div>
          {quotes?.slice(0, 1).map((q, i) => (
            <span key={i} style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>"{q}"</span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Frequency × Severity Matrix</div>
        <PainPointMatrix painPoints={points} />
      </div>

      <div className="content-card">
        <div className="card-title">Pain Points ({points.length})</div>
        <Table dataSource={points} columns={columns} rowKey="issue" pagination={false} size="small" />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PainPointMatrix.tsx frontend/src/pages/PainPoints.tsx
git commit -m "feat: redesign Pain Points page with styled matrix and table"
```

---

### Task 8: Redesign Needs, Schedules, Reports Pages

**Files:**
- Modify: `frontend/src/components/NeedsList.tsx`
- Modify: `frontend/src/pages/Needs.tsx`
- Modify: `frontend/src/pages/Schedules.tsx`
- Modify: `frontend/src/pages/Reports.tsx`

- [ ] **Step 1: Rewrite NeedsList.tsx**

```tsx
// frontend/src/components/NeedsList.tsx
interface Need {
  need: string;
  mentions: number;
  market_potential: string;
  sample_quotes?: string[];
}

interface Props {
  needs: Need[];
}

const potentialClass: Record<string, string> = {
  high: "potential-high",
  medium: "potential-medium",
  low: "potential-low",
};

export default function NeedsList({ needs }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {needs.map((n, i) => (
        <div key={i} className="content-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{n.need}</span>
            <span className={`pill ${potentialClass[n.market_potential] || ""}`}>
              {n.market_potential} potential
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Mentioned {n.mentions} times
          </p>
          {n.sample_quotes?.map((q, j) => (
            <p key={j} style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 4 }}>
              "{q}"
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update Needs.tsx (minor — wrap in Spin/Empty with consistent styling)**

```tsx
// frontend/src/pages/Needs.tsx
import { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
import NeedsList from "../components/NeedsList";
import api from "../api/client";

interface NeedsResult {
  id: string;
  summary: string;
  details: {
    unmet_needs?: Array<{
      need: string;
      mentions: number;
      market_potential: string;
      sample_quotes?: string[];
    }>;
  };
}

export default function Needs() {
  const [results, setResults] = useState<NeedsResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/needs").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No unmet needs data yet." />;

  const latest = results[0];
  const needs = latest.details.unmet_needs || [];

  return <NeedsList needs={needs} />;
}
```

- [ ] **Step 3: Rewrite Schedules.tsx**

```tsx
// frontend/src/pages/Schedules.tsx
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message } from "antd";
import api from "../api/client";

interface Schedule {
  id: string;
  keyword: string;
  platform: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

const platformPill: Record<string, string> = {
  tiktok: "pill-tiktok",
  youtube: "pill-youtube",
  reddit: "pill-reddit",
  amazon: "pill-amazon",
};

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchSchedules = useCallback(() => {
    setLoading(true);
    api.get("/schedules").then((res) => {
      setSchedules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const onCreate = async (values: { keyword: string; platform: string; cron_expression: string }) => {
    try {
      await api.post("/schedules", values);
      message.success("Schedule created");
      setModalOpen(false);
      form.resetFields();
      fetchSchedules();
    } catch {
      message.error("Failed to create schedule");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await api.put(`/schedules/${id}`, { is_active: active });
    fetchSchedules();
  };

  const deleteSchedule = async (id: string) => {
    await api.delete(`/schedules/${id}`);
    message.success("Deleted");
    fetchSchedules();
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      title: "Platform", dataIndex: "platform", key: "platform",
      render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span>,
    },
    { title: "Cron", dataIndex: "cron_expression", key: "cron_expression", render: (v: string) => <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{v}</code> },
    {
      title: "Active", dataIndex: "is_active", key: "is_active",
      render: (active: boolean, record: Schedule) => <Switch checked={active} onChange={(v) => toggleActive(record.id, v)} />,
    },
    { title: "Last Run", dataIndex: "last_run_at", key: "last_run_at", render: (v: string | null) => <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{v || "Never"}</span> },
    {
      title: "", key: "actions",
      render: (_: unknown, record: Schedule) => (
        <Button danger size="small" type="text" onClick={() => deleteSchedule(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalOpen(true)}>+ Add Schedule</Button>
      </div>
      <div className="content-card">
        <Table dataSource={schedules} columns={columns} rowKey="id" loading={loading} size="small" />
      </div>
      <Modal title="New Schedule" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Create">
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ platform: "tiktok", cron_expression: "0 8 * * *" }}>
          <Form.Item name="keyword" label="Keyword" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="platform" label="Platform">
            <Select>
              <Select.Option value="tiktok">TikTok</Select.Option>
              <Select.Option value="youtube">YouTube</Select.Option>
              <Select.Option value="reddit">Reddit</Select.Option>
              <Select.Option value="amazon">Amazon</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cron_expression" label="Cron Expression" extra="e.g., '0 8 * * *' = daily at 8am"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

- [ ] **Step 4: Rewrite Reports.tsx**

```tsx
// frontend/src/pages/Reports.tsx
import { useEffect, useState } from "react";
import { Button, Select, message, Empty, Spin } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
}

export default function Reports() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tasks?limit=100").then((res) => {
      setTasks(res.data.filter((t: Task) => t.status === "completed"));
    });
  }, []);

  const generateReport = async () => {
    if (!selectedTask) { message.warning("Select a task first"); return; }
    setLoading(true);
    try {
      const res = await api.post("/reports", { task_id: selectedTask });
      setReport(res.data.content);
    } catch {
      message.error("Failed to generate report. Make sure analysis has been run.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="content-card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Select
          placeholder="Select a completed task"
          style={{ flex: 1 }}
          onChange={setSelectedTask}
          value={selectedTask || undefined}
        >
          {tasks.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              {t.keyword} <span style={{ color: "var(--color-text-secondary)" }}>({t.platform})</span>
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={generateReport} loading={loading}>Generate Report</Button>
      </div>
      {report ? (
        <div className="content-card">
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.7, color: "var(--color-text)" }}>{report}</pre>
        </div>
      ) : (
        <Empty description="Select a task and generate a report" />
      )}
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/NeedsList.tsx frontend/src/pages/Needs.tsx frontend/src/pages/Schedules.tsx frontend/src/pages/Reports.tsx
git commit -m "feat: redesign Needs, Schedules, and Reports pages"
```

---

### Task 9: Final Build & Verify

- [ ] **Step 1: Build frontend**

Run: `cd /Users/aisenyc/work/probexa/frontend && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Visual check — start dev server**

Run: `cd /Users/aisenyc/work/probexa/frontend && npm run dev`
Visit `http://localhost:5173` and verify:
- Collapsible sidebar with indigo gradient logo
- Dashboard with stat cards, gradient chart, platform bars
- Tasks page with pills and action tags
- Trends page with gradient bar chart and trend cards
- Pain Points with scatter plot and styled table
- Needs with card list and potential pills
- Schedules with colored platform pills
- Reports with clean card layout

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: verify UI redesign builds and renders correctly"
```
