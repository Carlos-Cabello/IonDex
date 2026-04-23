import { useState } from "react";
import type { Pokemon, PokemonForm, MegaForm } from "../types";
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
  const [megaIdx, setMegaIdx] = useState(0);
  const [spriteError, setSpriteError] = useState(false);

  const activeMega: MegaForm | null = megaIdx > 0 ? pokemon.megas[megaIdx - 1] : null;

  const displayId = activeMega?.id ?? pokemon.id;
  const displayTypes = activeMega?.types ?? pokemon.types;
  const displayAbilities = activeMega?.abilities ?? pokemon.abilities;
  const displayHp = activeMega?.hp ?? pokemon.hp;
  const displayAtk = activeMega?.atk ?? pokemon.atk;
  const displayDef = activeMega?.def ?? pokemon.def;
  const displaySpa = activeMega?.spa ?? pokemon.spa;
  const displaySpd = activeMega?.spd ?? pokemon.spd;
  const displaySpe = activeMega?.spe ?? pokemon.spe;

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${displayId}.png`;

  function cycleMega(e: React.MouseEvent) {
    e.stopPropagation();
    setSpriteError(false);
    setMegaIdx((i) => (i + 1) % (pokemon.megas.length + 1));
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
                onClick={cycleMega}
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

      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        {displayAbilities.map((a) => <AbilityRow key={a} name={a} />)}
      </div>
    </div>
  );
}

export function FormCard({ pokemon, form }: { pokemon: Pokemon; form: PokemonForm }) {
  const [spriteError, setSpriteError] = useState(false);
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.id}.png`;

  return (
    <div style={{
      background: "#1a1f1f",
      border: "1px solid #1e3a3a",
      borderRadius: 10,
      padding: "14px 14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {spriteError ? (
          <div style={{
            width: 56, height: 56, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0f2a2a", borderRadius: 8,
            color: "#67e8f9", fontSize: 32, fontWeight: 900, userSelect: "none",
          }}>
            ?
          </div>
        ) : (
          <img
            src={spriteUrl}
            alt={pokemon.name}
            style={{ width: 56, height: 56, imageRendering: "pixelated", flexShrink: 0 }}
            onError={() => setSpriteError(true)}
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: "#555", fontSize: 11, lineHeight: 1 }}>#{String(pokemon.id).padStart(4, "0")}</div>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pokemon.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {form.types.map((t) => <TypeBadge key={t} type={t} small />)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 0", fontSize: 12 }}>
        <StatMini label="HP" value={form.hp} />
        <StatMini label="Atk" value={form.atk} />
        <StatMini label="Def" value={form.def} />
        <StatMini label="SpA" value={form.spa} />
        <StatMini label="SpD" value={form.spd} />
        <StatMini label="Spe" value={form.spe} />
      </div>

      <div style={{ borderTop: "1px solid #1e3a3a", paddingTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        {form.abilities.map((a) => <AbilityRow key={a} name={a} />)}
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

function AbilityRow({ name }: { name: string }) {
  return <div style={{ fontSize: 11, color: "#bbb" }}>{name}</div>;
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

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 0", fontSize: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10 }}>&nbsp;</div>
            <div style={{ fontWeight: 600, color: "#ccc" }}>&nbsp;</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ fontSize: 11 }}>&nbsp;</div>
        ))}
      </div>
    </div>
  );
}
