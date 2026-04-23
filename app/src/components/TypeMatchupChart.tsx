import { TYPE_COLORS, TYPE_TEXT } from "../typeColors";

interface Props {
  matchups: Record<string, number>;
  allTypes: string[];
  title: string;
}

const FACTOR_LABEL: Record<number, string> = {
  0: "0×",
  0.25: "¼×",
  0.5: "½×",
  1: "1×",
  2: "2×",
  4: "4×",
};


export function TypeMatchupChart({ matchups, allTypes, title }: Props) {
  const groups: Record<number, string[]> = { 0: [], 0.25: [], 0.5: [], 2: [], 4: [] };

  for (const type of allTypes) {
    const f = matchups[type] ?? 1;
    if (f !== 1 && groups[f] !== undefined) groups[f].push(type);
  }

  const interesting = [4, 2, 0.5, 0.25, 0] as const;

  return (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </h3>
      <div style={{ display: "grid", gap: 8 }}>
        {interesting.map((factor) => {
          const typeList = groups[factor];
          if (typeList.length === 0) return null;
          return (
            <div key={factor} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span
                style={{
                  minWidth: 36,
                  fontSize: 13,
                  fontWeight: 800,
                  color: factor >= 2 ? "#ef5350" : factor === 0 ? "#888" : "#64b5f6",
                  textAlign: "right",
                  paddingTop: 3,
                }}
              >
                {FACTOR_LABEL[factor]}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {typeList.map((type) => (
                  <TypeChip key={type} type={type} factor={factor} />
                ))}
              </div>
            </div>
          );
        })}
        {interesting.every((f) => groups[f].length === 0) && (
          <p style={{ color: "#666", fontSize: 13, margin: 0 }}>All neutral</p>
        )}
      </div>
    </div>
  );
}

function TypeChip({ type, factor }: { type: string; factor: number }) {
  return (
    <span
      style={{
        background: TYPE_COLORS[type] ?? "#aaa",
        color: TYPE_TEXT[type] ?? "#fff",
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        outline: factor >= 2 ? "2px solid rgba(255,255,255,0.25)" : factor === 0 ? "2px solid #555" : "none",
      }}
    >
      {type}
    </span>
  );
}
