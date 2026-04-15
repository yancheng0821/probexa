import { useEffect, useState } from "react";
import { Button, Card, Select, message, Empty } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
}

export default function Reports() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tasks?limit=100").then((res) => {
      setTasks(res.data.filter((t: Task) => t.status === "completed"));
    });
  }, []);

  const generateReport = async () => {
    if (!selectedTask) {
      message.warning("Select a task first");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/reports", { task_id: selectedTask });
      setReport(res.data.content);
    } catch {
      message.error("Failed to generate report. Make sure analysis has been run.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <Select
          placeholder="Select a completed task"
          style={{ width: 400, marginRight: 16 }}
          onChange={setSelectedTask}
          value={selectedTask || undefined}
        >
          {tasks.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              {t.keyword} ({t.platform})
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={generateReport} loading={loading}>
          Generate Report
        </Button>
      </Card>
      {report ? (
        <Card style={{ marginTop: 16 }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{report}</pre>
        </Card>
      ) : (
        <Empty description="Select a task and generate a report" style={{ marginTop: 24 }} />
      )}
    </>
  );
}
