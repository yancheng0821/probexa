import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks?limit=10").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    pending: "blue",
    running: "orange",
    completed: "green",
    failed: "red",
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Platform", dataIndex: "platform", key: "platform" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    { title: "Items", dataIndex: "total_items", key: "total_items" },
    { title: "Created", dataIndex: "created_at", key: "created_at" },
  ];

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalItems = tasks.reduce((sum, t) => sum + t.total_items, 0);

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="Total Tasks" value={tasks.length} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Completed" value={completedCount} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Total Items Scraped" value={totalItems} /></Card>
        </Col>
      </Row>
      <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} pagination={false} />
    </>
  );
}
