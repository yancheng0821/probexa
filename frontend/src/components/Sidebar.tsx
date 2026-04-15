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
      <div style={{ padding: collapsed ? "16px 12px" : "16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
          }}
        >
          P
        </div>
        {!collapsed && <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)" }}>Probexa</span>}
      </div>

      <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                background: active ? "#f0f0ff" : "transparent",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f8f9fa"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--color-border)" }}>
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
            color: "var(--color-text-secondary)", fontSize: 18,
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
