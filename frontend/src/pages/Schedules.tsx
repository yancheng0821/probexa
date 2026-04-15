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
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Platform", dataIndex: "platform", key: "platform" },
    { title: "Cron", dataIndex: "cron_expression", key: "cron_expression" },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean, record: Schedule) => (
        <Switch checked={active} onChange={(v) => toggleActive(record.id, v)} />
      ),
    },
    { title: "Last Run", dataIndex: "last_run_at", key: "last_run_at", render: (v: string | null) => v || "Never" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Schedule) => (
        <Button danger size="small" onClick={() => deleteSchedule(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
        Add Schedule
      </Button>
      <Table dataSource={schedules} columns={columns} rowKey="id" loading={loading} />
      <Modal title="New Schedule" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ platform: "tiktok", cron_expression: "0 8 * * *" }}>
          <Form.Item name="keyword" label="Keyword" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="platform" label="Platform">
            <Select>
              <Select.Option value="tiktok">TikTok</Select.Option>
              <Select.Option value="youtube">YouTube</Select.Option>
              <Select.Option value="reddit">Reddit</Select.Option>
              <Select.Option value="amazon">Amazon</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cron_expression" label="Cron Expression" extra="e.g., '0 8 * * *' = daily at 8am">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
