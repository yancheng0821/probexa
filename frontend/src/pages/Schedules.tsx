import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message } from "antd";
import api from "../api/client";

interface Schedule {
  id: string;
  keyword: string;
  platform: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

const platformPill: Record<string, string> = {
  tiktok: "pill-tiktok",
  youtube: "pill-youtube",
  reddit: "pill-reddit",
  amazon: "pill-amazon",
};

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchSchedules = useCallback(() => {
    setLoading(true);
    api.get("/schedules").then((res) => {
      setSchedules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const onCreate = async (values: { keyword: string; platform: string; cron_expression: string }) => {
    try {
      await api.post("/schedules", values);
      message.success("Schedule created");
      setModalOpen(false);
      form.resetFields();
      fetchSchedules();
    } catch {
      message.error("Failed to create schedule");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await api.put(`/schedules/${id}`, { is_active: active });
    fetchSchedules();
  };

  const deleteSchedule = async (id: string) => {
    await api.delete(`/schedules/${id}`);
    message.success("Deleted");
    fetchSchedules();
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: "Platform", dataIndex: "platform", key: "platform", render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span> },
    { title: "Cron", dataIndex: "cron_expression", key: "cron_expression", render: (v: string) => <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{v}</code> },
    { title: "Active", dataIndex: "is_active", key: "is_active", render: (active: boolean, record: Schedule) => <Switch checked={active} onChange={(v) => toggleActive(record.id, v)} /> },
    { title: "Last Run", dataIndex: "last_run_at", key: "last_run_at", render: (v: string | null) => <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{v || "Never"}</span> },
    { title: "", key: "actions", render: (_: unknown, record: Schedule) => <Button danger size="small" type="text" onClick={() => deleteSchedule(record.id)}>Delete</Button> },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalOpen(true)}>+ Add Schedule</Button>
      </div>
      <div className="content-card">
        <Table dataSource={schedules} columns={columns} rowKey="id" loading={loading} size="small" />
      </div>
      <Modal title="New Schedule" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Create">
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ platform: "tiktok", cron_expression: "0 8 * * *" }}>
          <Form.Item name="keyword" label="Keyword" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="platform" label="Platform">
            <Select>
              <Select.Option value="tiktok">TikTok</Select.Option>
              <Select.Option value="youtube">YouTube</Select.Option>
              <Select.Option value="reddit">Reddit</Select.Option>
              <Select.Option value="amazon">Amazon</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cron_expression" label="Cron Expression" extra="e.g., '0 8 * * *' = daily at 8am"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
