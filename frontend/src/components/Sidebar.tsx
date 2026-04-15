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
import { useI18n } from "../i18n/context";
import type { TranslationKey } from "../i18n/locales";

const navItems: { path: string; icon: React.ReactNode; labelKey: TranslationKey }[] = [
  { path: "/", icon: <BarChartOutlined />, labelKey: "nav.dashboard" },
  { path: "/tasks", icon: <SearchOutlined />, labelKey: "nav.tasks" },
  { path: "/trends", icon: <RiseOutlined />, labelKey: "nav.trends" },
  { path: "/pain-points", icon: <WarningOutlined />, labelKey: "nav.painPoints" },
  { path: "/needs", icon: <BulbOutlined />, labelKey: "nav.needs" },
  { path: "/schedules", icon: <ClockCircleOutlined />, labelKey: "nav.schedules" },
  { path: "/reports", icon: <FileTextOutlined />, labelKey: "nav.reports" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const width = collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-expanded)";

  return (
    <div
      style={{
        width, minWidth: width, height: "100vh",
        background: "var(--color-bg-card)",
        borderRight: "1px solid var(--color-border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease, min-width 0.2s ease",
        position: "sticky", top: 0, zIndex: 100,
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
              {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{t(item.labelKey)}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: "8px 8px 12px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Collapse Toggle */}
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
          {!collapsed && <span style={{ fontSize: 13 }}>{t("nav.collapse")}</span>}
        </div>
      </div>
    </div>
  );
}
