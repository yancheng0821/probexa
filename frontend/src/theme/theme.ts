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
