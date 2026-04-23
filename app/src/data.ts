import type { Pokemon } from "./types";

let pokemonCache: Pokemon[] | null = null;

export async function loadPokemon(): Promise<Pokemon[]> {
  if (pokemonCache) return pokemonCache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/pokemon.json`);
  pokemonCache = await res.json();
  return pokemonCache!;
}
