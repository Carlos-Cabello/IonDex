import { useState } from "react";
import type { Pokemon, PokemonForm } from "../types";
import { TypeBadge } from "./TypeBadge";

interface Props {
  pokemon: Pokemon;
  pinned?: boolean;
  onClick: () => void;
}

function megaFallbackLetter(label: string): string {
  const last = label.split(" ").pop() ?? "M";
  return ["X", "Y", "Z"].includes(last) ? last : "M";
}

export function PokemonCard({ pokemon, pinned, onClick }: Props) {
  // 0 = base form, 1..n = mega forms
  const [formIdx, setFormIdx] = useState(0);
  const [spriteError, setSpriteError] = useState(false);

  const allForms: Array<PokemonForm | null> = [null, ...pokemon.megas];
  const activeMega = formIdx > 0 ? pokemon.megas[formIdx - 1] : null;

  const displayId = activeMega?.id ?? pokemon.id;
  const displayTypes = activeMega?.types ?? pokemon.types;
  const displayHp = activeMega?.hp ?? pokemon.hp;
  const displayAtk = activeMega?.atk ?? pokemon.atk;
  const displayDef = activeMega?.def ?? pokemon.def;
  const displaySpa = activeMega?.spa ?? pokemon.spa;
  const displaySpd = activeMega?.spd ?? pokemon.spd;
  const displaySpe = activeMega?.spe ?? pokemon.spe;
  const displayBst = activeMega?.bst ?? pokemon.bst;

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${displayId}.png`;

  function cycleForm(e: React.MouseEvent) {
    e.stopPropagation();
    setSpriteError(false);
    setFormIdx((i) => (i + 1) % allForms.length);
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: pinned ? "#0f1f3d" : "#1e1e1e",
        border: `1px solid ${pinned ? "#1d4ed8" : "#2e2e2e"}`,
        borderRadius: 10,
        padding: "14px 14px 12px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = pinned ? "#3b82f6" : "#555";
        (e.currentTarget as HTMLDivElement).style.background = pinned ? "#162850" : "#252525";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = pinned ? "#1d4ed8" : "#2e2e2e";
        (e.currentTarget as HTMLDivElement).style.background = pinned ? "#0f1f3d" : "#1e1e1e";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {activeMega && spriteError ? (
          <div style={{
            width: 56, height: 56, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#2d1f4e", borderRadius: 8,
            color: "#a78bfa", fontSize: 32, fontWeight: 900, userSelect: "none",
          }}>
            {megaFallbackLetter(activeMega.label)}
          </div>
        ) : (
          <img
            src={spriteUrl}
            alt={pokemon.name}
            style={{ width: 56, height: 56, imageRendering: "pixelated", flexShrink: 0 }}
            onError={() => { if (activeMega) setSpriteError(true); }}
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ color: "#555", fontSize: 11, lineHeight: 1 }}>#{String(pokemon.id).padStart(4, "0")}</div>
            {pokemon.megas.length > 0 && (
              <button
                onClick={cycleForm}
                style={{
                  background: activeMega ? "#7c3aed" : "#2d1f4e",
                  color: activeMega ? "#fff" : "#a78bfa",
                  border: `1px solid ${activeMega ? "#7c3aed" : "#4c3a7a"}`,
                  borderRadius: 3,
                  padding: "1px 5px",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}
              >
                {activeMega ? activeMega.label : "Mega"}
              </button>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pokemon.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {displayTypes.map((t) => <TypeBadge key={t} type={t} small />)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 0", fontSize: 12 }}>
        <StatMini label="HP" value={displayHp} />
        <StatMini label="Atk" value={displayAtk} />
        <StatMini label="Def" value={displayDef} />
        <StatMini label="SpA" value={displaySpa} />
        <StatMini label="SpD" value={displaySpd} />
        <StatMini label="Spe" value={displaySpe} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2a2a", paddingTop: 6, fontSize: 12 }}>
        <span style={{ color: "#666" }}>BST</span>
        <span style={{ fontWeight: 700 }}>{displayBst}</span>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#555", fontSize: 10 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#ccc" }}>{value}</div>
    </div>
  );
}

export function PinPlaceholderCard() {
  return (
    <div style={{
      border: "1px dashed #2a2a2a",
      borderRadius: 10,
      padding: "14px 14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#3a3a3a",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 1.4,
        pointerEvents: "none",
      }}>
        Click a Pokémon<br />to pin it here
      </div>

      {/* mirrors image+name row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }} />
      </div>

      {/* mirrors stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 0", fontSize: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10 }}>&nbsp;</div>
            <div style={{ fontWeight: 600, color: "#ccc" }}>&nbsp;</div>
          </div>
        ))}
      </div>

      {/* mirrors BST row */}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2a2a", paddingTop: 6, fontSize: 12 }}>&nbsp;</div>
    </div>
  );
}
