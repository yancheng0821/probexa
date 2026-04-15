import { Form, Input, Select, InputNumber, Button, message } from "antd";
import api from "../api/client";

interface Props {
  onCreated: () => void;
}

export default function TaskForm({ onCreated }: Props) {
  const [form] = Form.useForm();

  const onFinish = async (values: { keyword: string; platform: string; max_items: number }) => {
    try {
      await api.post("/tasks", values);
      message.success("Task created");
      form.resetFields();
      onCreated();
    } catch {
      message.error("Failed to create task");
    }
  };

  return (
    <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ platform: "tiktok", max_items: 500 }}>
      <Form.Item name="keyword" rules={[{ required: true, message: "Enter keyword" }]}>
        <Input placeholder="Search keyword" style={{ width: 200 }} />
      </Form.Item>
      <Form.Item name="platform">
        <Select style={{ width: 120 }}>
          <Select.Option value="tiktok">TikTok</Select.Option>
          <Select.Option value="youtube">YouTube</Select.Option>
          <Select.Option value="reddit">Reddit</Select.Option>
          <Select.Option value="amazon">Amazon</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="max_items">
        <InputNumber min={10} max={10000} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Start Scraping
        </Button>
      </Form.Item>
    </Form>
  );
}
