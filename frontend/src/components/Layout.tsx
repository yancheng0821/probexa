import { ConfigProvider } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import theme from "../theme/theme";
import { useI18n } from "../i18n/context";
import type { TranslationKey } from "../i18n/locales";

const pageKeys: Record<string, { title: TranslationKey; subtitle: TranslationKey }> = {
  "/": { title: "page.dashboard.title", subtitle: "page.dashboard.subtitle" },
  "/tasks": { title: "page.tasks.title", subtitle: "page.tasks.subtitle" },
  "/trends": { title: "page.trends.title", subtitle: "page.trends.subtitle" },
  "/pain-points": { title: "page.painPoints.title", subtitle: "page.painPoints.subtitle" },
  "/needs": { title: "page.needs.title", subtitle: "page.needs.subtitle" },
  "/schedules": { title: "page.schedules.title", subtitle: "page.schedules.subtitle" },
  "/reports": { title: "page.reports.title", subtitle: "page.reports.subtitle" },
};

export default function Layout() {
  const location = useLocation();
  const { locale, setLocale, t } = useI18n();
  const keys = pageKeys[location.pathname];

  return (
    <ConfigProvider theme={theme}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{
            padding: "20px 28px 0",
            background: "var(--color-bg-page)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                {keys ? t(keys.title) : "Probexa"}
              </h1>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                {keys ? t(keys.subtitle) : ""}
              </p>
            </div>
            <div
              onClick={() => setLocale(locale === "en" ? "zh" : "en")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: 13,
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
            >
              <GlobalOutlined style={{ fontSize: 14 }} />
              <span>{locale === "en" ? "中文" : "English"}</span>
            </div>
          </header>
          <main style={{ flex: 1, padding: "16px 28px 28px" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
