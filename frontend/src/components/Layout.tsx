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
          <header style={{ padding: "20px 28px 0", background: "var(--color-bg-page)" }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {pageTitles[location.pathname] || "Probexa"}
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {pageSubtitles[location.pathname] || ""}
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
