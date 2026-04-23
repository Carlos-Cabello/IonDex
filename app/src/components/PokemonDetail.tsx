import type { Pokemon, StatKey, TypeChart } from "../types";
import { getDefensiveMatchups, getOffensiveMatchups } from "../data";
import { StatBars } from "./StatBar";
import { TypeBadge } from "./TypeBadge";
import { TypeMatchupChart } from "./TypeMatchupChart";

interface Props {
  pokemon: Pokemon;
  typeChart: TypeChart;
  onClose: () => void;
}

export function PokemonDetail({ pokemon, typeChart, onClose }: Props) {
  const defensive = getDefensiveMatchups(pokemon.types, typeChart.matrix, typeChart.types);
  const offensive = getOffensiveMatchups(pokemon.types, typeChart.matrix, typeChart.types);

  const stats: Record<StatKey, number> = {
    hp: pokemon.hp,
    atk: pokemon.atk,
    def: pokemon.def,
    spa: pokemon.spa,
    spd: pokemon.spd,
    spe: pokemon.spe,
  };

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: 12,
          padding: 28,
          maxWidth: 680,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            color: "#888",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <img
            src={spriteUrl}
            alt={pokemon.name}
            style={{ width: 96, height: 96, imageRendering: "pixelated" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div>
            <div style={{ color: "#666", fontSize: 13, marginBottom: 2 }}>#{String(pokemon.id).padStart(4, "0")}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800 }}>{pokemon.name}</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {/* Stats */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Base Stats
            </h3>
            <StatBars stats={stats} />
          </div>

          {/* Type matchups */}
          <div style={{ display: "grid", gap: 24 }}>
            <TypeMatchupChart
              matchups={defensive}
              allTypes={typeChart.types}
              title="Weaknesses & Resistances"
            />
            <TypeMatchupChart
              matchups={offensive}
              allTypes={typeChart.types}
              title="Offensive Coverage (STAB)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
