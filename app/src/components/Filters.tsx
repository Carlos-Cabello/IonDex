import type { StatKey } from "../types";
import { STAT_LABELS, SEASONS } from "../types";

export interface FilterState {
  season: string;
  search: string;
  sortBy: StatKey | "bst" | "id";
  sortDir: "asc" | "desc";
  minStats: Partial<Record<StatKey, number>>;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const SORT_OPTIONS: Array<{ value: FilterState["sortBy"]; label: string }> = [
  { value: "id", label: "Dex #" },
  { value: "bst", label: "BST" },
  { value: "spe", label: "Speed" },
  { value: "atk", label: "Attack" },
  { value: "spa", label: "Sp. Atk" },
  { value: "def", label: "Defense" },
  { value: "spd", label: "Sp. Def" },
  { value: "hp", label: "HP" },
];

export function Filters({ filters, onChange }: Props) {
  function set(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch });
  }

  function setMinStat(stat: StatKey, val: string) {
    const num = val === "" ? undefined : Number(val);
    set({ minStats: { ...filters.minStats, [stat]: num } });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search Pokémon..."
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        style={{
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "8px 14px",
          color: "#fff",
          fontSize: 15,
          width: "100%",
          boxSizing: "border-box",
          outline: "none",
        }}
      />

      {/* Season selector */}
      <div>
        <div style={{ color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Season
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SEASONS.map((s) => {
            const active = filters.season === s.key;
            return (
              <button
                key={s.key}
                onClick={() => set({ season: s.key })}
                style={{
                  background: active ? "#e53935" : "#1e1e1e",
                  color: active ? "#fff" : "#666",
                  border: `1px solid ${active ? "transparent" : "#333"}`,
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: active ? "default" : "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14 }}>🏆</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Sort
        </div>
        <select
          value={filters.sortBy}
          onChange={(e) => set({ sortBy: e.target.value as FilterState["sortBy"] })}
          style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 6, padding: "4px 8px", color: "#ccc", fontSize: 13, cursor: "pointer" }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => set({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
          style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", color: "#ccc", fontSize: 13, cursor: "pointer" }}
        >
          {filters.sortDir === "desc" ? "↓ High" : "↑ Low"}
        </button>
      </div>

      {/* Min stat filters */}
      <div>
        <div style={{ color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Min Stats
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px 10px" }}>
          {(["spe", "atk", "spa", "def", "spd", "hp"] as StatKey[]).map((stat) => (
            <div key={stat} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <label style={{ color: "#666", fontSize: 11 }}>{STAT_LABELS[stat]}</label>
              <input
                type="number"
                min={0}
                max={255}
                placeholder="0"
                value={filters.minStats[stat] ?? ""}
                onChange={(e) => setMinStat(stat, e.target.value)}
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #333",
                  borderRadius: 5,
                  padding: "4px 6px",
                  color: "#ccc",
                  fontSize: 13,
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
