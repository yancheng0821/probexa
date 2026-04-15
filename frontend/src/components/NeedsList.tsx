import { Card, Tag } from "antd";

interface Need {
  need: string;
  mentions: number;
  market_potential: string;
  sample_quotes?: string[];
}

interface Props {
  needs: Need[];
}

const potentialColor: Record<string, string> = { high: "green", medium: "orange", low: "default" };

export default function NeedsList({ needs }: Props) {
  return (
    <>
      {needs.map((n, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <h3>
            {n.need} <Tag color={potentialColor[n.market_potential]}>{n.market_potential} potential</Tag>
          </h3>
          <p>Mentioned {n.mentions} times</p>
          {n.sample_quotes?.map((q, j) => (
            <p key={j} style={{ color: "#888", fontStyle: "italic" }}>"{q}"</p>
          ))}
        </Card>
      ))}
    </>
  );
}
