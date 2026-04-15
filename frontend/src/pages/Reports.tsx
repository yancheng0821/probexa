import { useEffect, useState } from "react";
import { Button, Select, message, Empty } from "antd";
import api from "../api/client";
import { useI18n } from "../i18n/context";

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
  const { t } = useI18n();

  useEffect(() => {
    api.get("/tasks?limit=100").then((res) => { setTasks(res.data.filter((t: Task) => t.status === "completed")); });
  }, []);

  const generateReport = async () => {
    if (!selectedTask) { message.warning(t("reports.selectFirst")); return; }
    setLoading(true);
    try {
      const res = await api.post("/reports", { task_id: selectedTask });
      setReport(res.data.content);
    } catch {
      message.error(t("reports.generateFailed"));
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="content-card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Select placeholder={t("reports.selectTask")} style={{ flex: 1 }} onChange={setSelectedTask} value={selectedTask || undefined}>
          {tasks.map((tk) => (
            <Select.Option key={tk.id} value={tk.id}>{tk.keyword} <span style={{ color: "var(--color-text-secondary)" }}>({tk.platform})</span></Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={generateReport} loading={loading}>{t("reports.generate")}</Button>
      </div>
      {report ? (
        <div className="content-card">
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.7, color: "var(--color-text)" }}>{report}</pre>
        </div>
      ) : (
        <Empty description={t("reports.noData")} />
      )}
    </>
  );
}
