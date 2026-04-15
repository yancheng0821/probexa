import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message } from "antd";
import api from "../api/client";
import { useI18n } from "../i18n/context";

interface Schedule {
  id: string;
  keyword: string;
  platform: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

const platformPill: Record<string, string> = { tiktok: "pill-tiktok", youtube: "pill-youtube", reddit: "pill-reddit", amazon: "pill-amazon" };

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useI18n();

  const fetchSchedules = useCallback(() => {
    setLoading(true);
    api.get("/schedules").then((res) => { setSchedules(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const onCreate = async (values: { keyword: string; platform: string; cron_expression: string }) => {
    try {
      await api.post("/schedules", values);
      message.success(t("schedules.created"));
      setModalOpen(false);
      form.resetFields();
      fetchSchedules();
    } catch {
      message.error("Failed to create schedule");
    }
  };

  const toggleActive = async (id: string, active: boolean) => { await api.put(`/schedules/${id}`, { is_active: active }); fetchSchedules(); };
  const deleteSchedule = async (id: string) => { await api.delete(`/schedules/${id}`); message.success(t("schedules.deleted")); fetchSchedules(); };

  const columns = [
    { title: t("tasks.keyword"), dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: t("tasks.platform"), dataIndex: "platform", key: "platform", render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span> },
    { title: t("schedules.cron"), dataIndex: "cron_expression", key: "cron_expression", render: (v: string) => <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{v}</code> },
    { title: t("schedules.active"), dataIndex: "is_active", key: "is_active", render: (active: boolean, record: Schedule) => <Switch checked={active} onChange={(v) => toggleActive(record.id, v)} /> },
    { title: t("schedules.lastRun"), dataIndex: "last_run_at", key: "last_run_at", render: (v: string | null) => <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{v || t("schedules.never")}</span> },
    { title: "", key: "actions", render: (_: unknown, record: Schedule) => <Button danger size="small" type="text" onClick={() => deleteSchedule(record.id)}>Delete</Button> },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}><Button type="primary" onClick={() => setModalOpen(true)}>{t("schedules.addSchedule")}</Button></div>
      <div className="content-card">
        <Table dataSource={schedules} columns={columns} rowKey="id" loading={loading} size="small" />
      </div>
      <Modal title={t("schedules.newSchedule")} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText={t("common.create")}>
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ platform: "tiktok", cron_expression: "0 8 * * *" }}>
          <Form.Item name="keyword" label={t("tasks.keyword")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="platform" label={t("tasks.platform")}>
            <Select>
              <Select.Option value="tiktok">TikTok</Select.Option>
              <Select.Option value="youtube">YouTube</Select.Option>
              <Select.Option value="reddit">Reddit</Select.Option>
              <Select.Option value="amazon">Amazon</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cron_expression" label={t("schedules.cron")} extra={t("schedules.cronHelp")}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
