import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Trends from "./pages/Trends";
import PainPoints from "./pages/PainPoints";
import Needs from "./pages/Needs";
import Schedules from "./pages/Schedules";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/pain-points" element={<PainPoints />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
