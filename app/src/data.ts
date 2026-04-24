import type { Pokemon } from "./types";

let pokemonCache: Pokemon[] | null = null;
let abilitiesCache: Record<string, string> | null = null;

export async function loadPokemon(): Promise<Pokemon[]> {
  if (pokemonCache) return pokemonCache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/pokemon.json`);
  pokemonCache = await res.json();
  return pokemonCache!;
}

export async function loadAbilities(): Promise<Record<string, string>> {
  if (abilitiesCache) return abilitiesCache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/abilities.json`);
  abilitiesCache = await res.json();
  return abilitiesCache!;
}
