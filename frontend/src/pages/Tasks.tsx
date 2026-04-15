import { useEffect, useState, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.get("/tasks").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return (
    <>
      <TaskForm onCreated={fetchTasks} />
      <div style={{ marginTop: 24 }}>
        <TaskList tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      </div>
    </>
  );
}
