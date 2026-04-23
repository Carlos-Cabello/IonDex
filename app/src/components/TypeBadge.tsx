import { TYPE_COLORS, TYPE_TEXT } from "../typeColors";

export function TypeBadge({ type, small }: { type: string; small?: boolean }) {
  return (
    <span
      style={{
        background: TYPE_COLORS[type] ?? "#aaa",
        color: TYPE_TEXT[type] ?? "#fff",
        padding: small ? "0 4px" : "2px 10px",
        borderRadius: 3,
        fontSize: small ? 8 : 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: small ? 0 : "0.05em",
        display: "inline-block",
      }}
    >
      {type}
    </span>
  );
}
