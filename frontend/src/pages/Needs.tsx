import { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
import NeedsList from "../components/NeedsList";
import api from "../api/client";

interface NeedsResult {
  id: string;
  summary: string;
  details: {
    unmet_needs?: Array<{
      need: string;
      mentions: number;
      market_potential: string;
      sample_quotes?: string[];
    }>;
  };
}

export default function Needs() {
  const [results, setResults] = useState<NeedsResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/needs").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No unmet needs data yet." />;

  const latest = results[0];
  const needs = latest.details.unmet_needs || [];

  return <NeedsList needs={needs} />;
}
