import { Form, Input, Select, InputNumber, Button, message } from "antd";
import api from "../api/client";
import { useI18n } from "../i18n/context";

interface Props {
  onCreated: () => void;
}

export default function TaskForm({ onCreated }: Props) {
  const [form] = Form.useForm();
  const { t } = useI18n();

  const onFinish = async (values: { keyword: string; platform: string; max_items: number }) => {
    try {
      await api.post("/tasks", values);
      message.success(t("tasks.created"));
      form.resetFields();
      onCreated();
    } catch {
      message.error(t("tasks.createFailed"));
    }
  };

  return (
    <div className="content-card" style={{ marginBottom: 20 }}>
      <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ platform: "tiktok", max_items: 500 }} style={{ gap: 8 }}>
        <Form.Item name="keyword" rules={[{ required: true, message: t("tasks.enterKeyword") }]} style={{ flex: 2 }}>
          <Input placeholder={t("tasks.enterKeyword")} />
        </Form.Item>
        <Form.Item name="platform" style={{ flex: 1 }}>
          <Select>
            <Select.Option value="tiktok">TikTok</Select.Option>
            <Select.Option value="youtube">YouTube</Select.Option>
            <Select.Option value="reddit">Reddit</Select.Option>
            <Select.Option value="amazon">Amazon</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="max_items" style={{ flex: 1 }}>
          <InputNumber min={10} max={10000} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{t("tasks.startScraping")}</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
