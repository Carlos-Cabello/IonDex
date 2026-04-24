import { useEffect, useState, useMemo } from "react";
import type { Pokemon, StatKey } from "./types";
import { loadPokemon } from "./data";
import { PokemonCard, FormCard, PinPlaceholderCard } from "./components/PokemonCard";
import { Filters } from "./components/Filters";
import type { FilterState } from "./components/Filters";

const DEFAULT_FILTERS: FilterState = {
  season: "m-1",
  search: "",
  sortBy: "id",
  sortDir: "asc",
  minStats: {},
};

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [pinnedLists, setPinnedLists] = useState<number[][]>(() => {
    try {
      const saved = localStorage.getItem("pinnedLists");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [[]];
  });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    loadPokemon().then(setPokemon);
  }, []);

  useEffect(() => {
    localStorage.setItem("pinnedLists", JSON.stringify(pinnedLists));
  }, [pinnedLists]);

  const pokemonById = useMemo(() => {
    const map = new Map<number, Pokemon>();
    for (const p of pokemon) map.set(p.id, p);
    return map;
  }, [pokemon]);

  // All pinned IDs across all lists (for highlight in main grid)
  const allPinnedIds = useMemo(() => new Set(pinnedLists.flat()), [pinnedLists]);

  function addToActive(id: number) {
    setPinnedLists((lists) => {
      const active = lists[lists.length - 1];
      if (active.includes(id)) return lists;
      const next = [...lists];
      next[next.length - 1] = [...active, id];
      return next;
    });
  }

  function removeFromActive(cardIdx: number) {
    setPinnedLists((lists) => {
      const next = [...lists];
      const active = [...next[next.length - 1]];
      active.splice(cardIdx, 1);
      next[next.length - 1] = active;
      return next;
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
        {isMobile && (
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px 0 0" }}
          >
            ☰
          </button>
        )}
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>IonDex</span>
        <span style={{ color: "#555", fontSize: 13 }}>Competitive Reference</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : sidebarOpen ? "280px 1fr" : "32px 1fr", height: "calc(100vh - 53px)", transition: "grid-template-columns 0.2s ease", position: "relative" }}>
        {/* Sidebar — overlay on mobile, column on desktop */}
        {isMobile ? (
          sidebarOpen && (
            <>
              <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 20 }} />
              <aside style={{ position: "fixed", left: 0, top: 53, bottom: 0, width: 280, background: "#131313", borderRight: "1px solid #222", overflowY: "auto", padding: "20px 18px", zIndex: 21 }}>
                <Filters filters={filters} onChange={setFilters} />
              </aside>
            </>
          )
        ) : (
          <aside style={{ borderRight: "1px solid #222", background: "#131313", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ position: "absolute", top: 12, right: 8, zIndex: 1, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
            >
              {sidebarOpen ? "‹" : "›"}
            </button>
            {sidebarOpen && (
              <div style={{ padding: "20px 18px", overflowY: "auto", flex: 1 }}>
                <Filters filters={filters} onChange={setFilters} />
              </div>
            )}
          </aside>
        )}

        {/* Main grid */}
        <main style={{ overflowY: "auto", padding: isMobile ? "12px" : "20px" }}>

          {/* Pinned lists */}
          {pinnedLists.map((list, listIdx) => {
            const isActive = listIdx === pinnedLists.length - 1;
            return (
              <div key={listIdx} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: isActive ? "#3b82f6" : "#555", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {`List ${listIdx + 1}`}
                  </span>
                  {!isActive && (
                    <span style={{ color: "#444", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>locked</span>
                  )}
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
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 130 : 180}px, 1fr))`, gap: isMobile ? 8 : 12 }}>
                  {list.length === 0
                    ? <PinPlaceholderCard compact={isMobile} />
                    : list.map((id, cardIdx) => {
                        const p = pokemonById.get(id);
                        if (!p) return null;
                        return (
                          <PokemonCard
                            key={`${id}-${cardIdx}`}
                            pokemon={p}
                            compact={isMobile}
                            onClick={isActive ? () => removeFromActive(cardIdx) : () => addToActive(id)}
                          />
                        );
                      })
                  }
                </div>

                {/* Divider — clickable only on the last list when it has cards */}
                <AddListDivider isLast={isActive} disabled={isActive && list.length === 0} onAdd={addList} />
              </div>
            );
          })}

          {/* Results count */}
          <div style={{ color: "#555", fontSize: 13, marginBottom: 14 }}>
            {isLoading ? "Loading…" : `${filtered.length} Pokémon`}
          </div>

          {/* Main grid */}
          {!isLoading && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 130 : 180}px, 1fr))`, gap: isMobile ? 8 : 12 }}>
              {filtered.flatMap((p) => [
                <PokemonCard key={p.id} pokemon={p} compact={isMobile} pinned={allPinnedIds.has(p.id)} onClick={() => addToActive(p.id)} />,
                ...p.forms.map((form) => (
                  <FormCard key={form.id} pokemon={p} form={form} compact={isMobile} />
                )),
              ])}
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
