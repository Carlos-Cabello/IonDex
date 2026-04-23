import type { Pokemon } from "./types";

let pokemonCache: Pokemon[] | null = null;
let typeListCache: string[] | null = null;

export async function loadPokemon(): Promise<Pokemon[]> {
  if (pokemonCache) return pokemonCache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/pokemon.json`);
  pokemonCache = await res.json();
  return pokemonCache!;
}

export async function loadTypeList(): Promise<string[]> {
  if (typeListCache) return typeListCache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/type-chart.json`);
  const data = await res.json();
  typeListCache = data.types;
  return typeListCache!;
}
