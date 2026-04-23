import type { Pokemon, TypeChart } from "./types";

let pokemonCache: Pokemon[] | null = null;
let typeChartCache: TypeChart | null = null;

export async function loadPokemon(): Promise<Pokemon[]> {
  if (pokemonCache) return pokemonCache;
  const res = await fetch("/data/pokemon.json");
  pokemonCache = await res.json();
  return pokemonCache!;
}

export async function loadTypeChart(): Promise<TypeChart> {
  if (typeChartCache) return typeChartCache;
  const res = await fetch("/data/type-chart.json");
  typeChartCache = await res.json();
  return typeChartCache!;
}

// Returns { factor } for each attacking type against the given defending types
export function getDefensiveMatchups(
  defenderTypes: string[],
  matrix: TypeChart["matrix"],
  allTypes: string[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const atkType of allTypes) {
    let factor = 1;
    for (const defType of defenderTypes) {
      factor *= matrix[atkType]?.[defType] ?? 1;
    }
    result[atkType] = factor;
  }
  return result;
}

// Returns the factor this pokemon's types deal against each defending type
export function getOffensiveMatchups(
  attackerTypes: string[],
  matrix: TypeChart["matrix"],
  allTypes: string[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const defType of allTypes) {
    let best = 0;
    for (const atkType of attackerTypes) {
      const factor = matrix[atkType]?.[defType] ?? 1;
      if (factor > best) best = factor;
    }
    result[defType] = best;
  }
  return result;
}
