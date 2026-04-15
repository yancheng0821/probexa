import { Table, Tag, Button, Space, message } from "antd";
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

export default function TaskList({ tasks, loading }: Props) {
  const statusColor: Record<string, string> = {
    pending: "blue",
    running: "orange",
    completed: "green",
    failed: "red",
  };

  const triggerAnalysis = async (taskId: string, type: string) => {
    try {
      await api.post("/analysis", { task_id: taskId, analysis_type: type });
      message.success(`${type} analysis started`);
    } catch {
      message.error("Failed to start analysis");
    }
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
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Task) => (
        <Space>
          {record.status === "completed" && (
            <>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "pain_points")}>
                Pain Points
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "trends")}>
                Trends
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "unmet_needs")}>
                Needs
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "pricing")}>
                Pricing
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} />;
}
