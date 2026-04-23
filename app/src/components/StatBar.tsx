import type { StatKey } from "../types";
import { STAT_LABELS } from "../types";

const STAT_MAX = 255; // Blissey HP
const STAT_COLORS: Record<StatKey, string> = {
  hp: "#ff5959",
  atk: "#f5ac78",
  def: "#fae078",
  spa: "#9db7f5",
  spd: "#a7db8d",
  spe: "#fa92b2",
};

export function StatBars({ stats }: { stats: Record<StatKey, number> }) {
  const keys: StatKey[] = ["hp", "atk", "def", "spa", "spd", "spe"];
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {keys.map((k) => (
        <StatRow key={k} stat={k} value={stats[k]} />
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "80px 36px 1fr", gap: 8, alignItems: "center", marginTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#aaa" }}>BST</span>
        <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>
          {keys.reduce((sum, k) => sum + stats[k], 0)}
        </span>
        <div />
      </div>
    </div>
  );
}

function StatRow({ stat, value }: { stat: StatKey; value: number }) {
  const pct = Math.min((value / STAT_MAX) * 100, 100);
  const color = STAT_COLORS[stat];
  const textColor = value >= 100 ? "#4caf50" : value <= 50 ? "#ef5350" : "#ccc";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 36px 1fr", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#999" }}>{STAT_LABELS[stat]}</span>
      <span style={{ fontSize: 14, fontWeight: 700, textAlign: "right", color: textColor }}>{value}</span>
      <div style={{ background: "#2a2a2a", borderRadius: 4, height: 12, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
