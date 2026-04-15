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
    { title: "Keyword", dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: "Platform", dataIndex: "platform", key: "platform", render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (v: string) => <span className={`pill ${statusPill[v] || ""}`}>{v}</span> },
    { title: "Items", dataIndex: "total_items", key: "total_items", render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span> },
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
