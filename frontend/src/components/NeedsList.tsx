interface Need {
  need: string;
  mentions: number;
  market_potential: string;
  sample_quotes?: string[];
}

interface Props {
  needs: Need[];
}

const potentialClass: Record<string, string> = {
  high: "potential-high",
  medium: "potential-medium",
  low: "potential-low",
};

export default function NeedsList({ needs }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {needs.map((n, i) => (
        <div key={i} className="content-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{n.need}</span>
            <span className={`pill ${potentialClass[n.market_potential] || ""}`}>
              {n.market_potential} potential
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Mentioned {n.mentions} times
          </p>
          {n.sample_quotes?.map((q, j) => (
            <p key={j} style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 4 }}>
              "{q}"
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
