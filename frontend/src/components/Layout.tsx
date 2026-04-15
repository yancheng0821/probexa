import { Layout as AntLayout, Menu } from "antd";
import {
  DashboardOutlined,
  SearchOutlined,
  RiseOutlined,
  WarningOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = AntLayout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/tasks", icon: <SearchOutlined />, label: "Tasks" },
  { key: "/trends", icon: <RiseOutlined />, label: "Trends" },
  { key: "/pain-points", icon: <WarningOutlined />, label: "Pain Points" },
  { key: "/needs", icon: <BulbOutlined />, label: "Needs" },
  { key: "/schedules", icon: <ClockCircleOutlined />, label: "Schedules" },
  { key: "/reports", icon: <FileTextOutlined />, label: "Reports" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", padding: "16px 24px" }}>
          Probexa
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: "#fff", padding: "0 24px", fontSize: 18 }}>
          {menuItems.find((m) => m.key === location.pathname)?.label || "Probexa"}
        </Header>
        <Content style={{ margin: 24, padding: 24, background: "#fff", borderRadius: 8 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
