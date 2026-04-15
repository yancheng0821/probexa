import { ConfigProvider } from "antd";
import { Outlet, useLocation } from "react-router-dom";
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
  const { t } = useI18n();
  const keys = pageKeys[location.pathname];

  return (
    <ConfigProvider theme={theme}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ padding: "20px 28px 0", background: "var(--color-bg-page)" }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {keys ? t(keys.title) : "Probexa"}
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {keys ? t(keys.subtitle) : ""}
            </p>
          </header>
          <main style={{ flex: 1, padding: "16px 28px 28px" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
