import { useEffect, useState, useMemo } from "react";
import type { Pokemon, StatKey } from "./types";
import { loadPokemon, loadTypeList } from "./data";
import { PokemonCard, PinPlaceholderCard } from "./components/PokemonCard";
import { Filters } from "./components/Filters";
import type { FilterState } from "./components/Filters";

const DEFAULT_FILTERS: FilterState = {
  season: "m-1",
  search: "",
  types: [],
  sortBy: "id",
  sortDir: "asc",
  minStats: {},
};

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [allTypes, setAllTypes] = useState<string[] | null>(null);
  // Each inner array is one pinned list; start with one empty list
  const [pinnedLists, setPinnedLists] = useState<number[][]>([[]]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    Promise.all([loadPokemon(), loadTypeList()]).then(([p, types]) => {
      setPokemon(p);
      setAllTypes(types);
    });
  }, []);

  const pokemonById = useMemo(() => {
    const map = new Map<number, Pokemon>();
    for (const p of pokemon) map.set(p.id, p);
    return map;
  }, [pokemon]);

  // All pinned IDs across all lists (for highlight in main grid)
  const allPinnedIds = useMemo(() => new Set(pinnedLists.flat()), [pinnedLists]);

  function togglePin(id: number) {
    setPinnedLists((lists) => {
      let next;
      if (lists.some((l) => l.includes(id))) {
        next = lists.map((l) => l.filter((x) => x !== id));
      } else {
        next = lists.map((l, i) => (i === lists.length - 1 ? [...l, id] : l));
      }
      // Remove empty non-last lists
      return next.filter((l, i) => i === next.length - 1 || l.length > 0);
    });
  }

  function addList() {
    setPinnedLists((lists) => [...lists, []]);
  }

  function deleteList(idx: number) {
    setPinnedLists((lists) => lists.filter((_, i) => i !== idx));
  }

  const filtered = useMemo(() => {
    let list = pokemon.filter((p) => p.seasons.includes(filters.season));

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.includes(q) || String(p.id) === q
      );
    }

    if (filters.types.length > 0) {
      list = list.filter((p) => filters.types.every((t) => p.types.includes(t)));
    }

    for (const [stat, min] of Object.entries(filters.minStats) as [StatKey, number | undefined][]) {
      if (min != null && min > 0) {
        list = list.filter((p) => p[stat] >= min);
      }
    }

    list = [...list].sort((a, b) => {
      const key = filters.sortBy;
      const av = key === "bst" ? a.bst : (a as any)[key];
      const bv = key === "bst" ? b.bst : (b as any)[key];
      return filters.sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [pokemon, filters]);

  const isLoading = pokemon.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#eee", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #222", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>IonDex</span>
        <span style={{ color: "#555", fontSize: 13 }}>Competitive Reference</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100vh - 53px)" }}>
        {/* Sidebar */}
        <aside style={{ borderRight: "1px solid #222", padding: "20px 18px", overflowY: "auto", background: "#131313" }}>
          {allTypes ? (
            <Filters filters={filters} allTypes={allTypes} onChange={setFilters} />
          ) : null}
        </aside>

        {/* Main grid */}
        <main style={{ overflowY: "auto", padding: "20px 20px" }}>

          {/* Pinned lists */}
          {pinnedLists.map((list, listIdx) => {
            const isLast = listIdx === pinnedLists.length - 1;
            const cards = list.map((id) => pokemonById.get(id)).filter(Boolean) as Pokemon[];
            return (
              <div key={listIdx} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#3b82f6", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {`List ${listIdx + 1}`}
                  </span>
                  <button
                    onClick={() => pinnedLists.length > 1 && deleteList(listIdx)}
                    disabled={pinnedLists.length === 1}
                    style={{ background: "none", border: "none", color: pinnedLists.length === 1 ? "#2a2a2a" : "#444", fontSize: 14, cursor: pinnedLists.length === 1 ? "default" : "pointer", padding: "0 2px", lineHeight: 1 }}
                    onMouseEnter={(e) => { if (pinnedLists.length > 1) (e.currentTarget as HTMLButtonElement).style.color = "#ef5350"; }}
                    onMouseLeave={(e) => { if (pinnedLists.length > 1) (e.currentTarget as HTMLButtonElement).style.color = "#444"; }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {cards.length === 0
                    ? <PinPlaceholderCard />
                    : cards.map((p) => (
                        <PokemonCard key={p.id} pokemon={p} onClick={() => togglePin(p.id)} />
                      ))
                  }
                </div>

                {/* Divider — clickable only on the last list when it has cards */}
                <AddListDivider isLast={isLast} disabled={isLast && list.length === 0} onAdd={addList} />
              </div>
            );
          })}

          {/* Results count */}
          <div style={{ color: "#555", fontSize: 13, marginBottom: 14 }}>
            {isLoading ? "Loading…" : `${filtered.length} Pokémon`}
          </div>

          {/* Main grid */}
          {!isLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {filtered.map((p) => (
                <PokemonCard key={p.id} pokemon={p} pinned={allPinnedIds.has(p.id)} onClick={() => togglePin(p.id)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AddListDivider({ isLast, disabled, onAdd }: { isLast: boolean; disabled?: boolean; onAdd: () => void }) {
  const [hovered, setHovered] = useState(false);

  if (!isLast) {
    return <div style={{ borderBottom: "1px solid #222", margin: "20px 0" }} />;
  }

  const active = hovered && !disabled;

  return (
    <div
      onClick={disabled ? undefined : onAdd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: "20px 0",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: disabled ? 0.2 : active ? 1 : 0.4,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ flex: 1, height: 1, background: active ? "#3b82f6" : "#222" }} />
      <span style={{ color: active ? "#3b82f6" : "#555", fontSize: 16, lineHeight: 1, userSelect: "none" }}>+</span>
      <div style={{ flex: 1, height: 1, background: active ? "#3b82f6" : "#222" }} />
    </div>
  );
}
