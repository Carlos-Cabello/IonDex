#!/usr/bin/env node
// Reads PokeAPI CSV files and outputs optimized JSON to app/public/data/

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_DIR = join(__dirname, "../data/pokeapi/data/v2/csv");
const OUT_DIR = join(__dirname, "../app/public/data");

function parseCSV(filename) {
  // Handle UTF-8 BOM that some files have
  const text = readFileSync(join(CSV_DIR, filename), "utf8").replace(/^﻿/, "");
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

// --- Load raw data ---
const pokemon = parseCSV("pokemon.csv");
const pokemonStats = parseCSV("pokemon_stats.csv");
const pokemonTypes = parseCSV("pokemon_types.csv");
const pokemonSpeciesNames = parseCSV("pokemon_species_names.csv");
const pokemonDexNumbers = parseCSV("pokemon_dex_numbers.csv");
const types = parseCSV("types.csv");
const typeEfficacy = parseCSV("type_efficacy.csv");

// --- Build type id -> name map ---
// Only real battle types (1-18, skip stellar/unknown/shadow)
const REAL_TYPE_IDS = new Set(Array.from({ length: 18 }, (_, i) => String(i + 1)));
const typeById = {};
for (const t of types) typeById[t.id] = t.identifier;

const realTypes = types
  .filter((t) => REAL_TYPE_IDS.has(t.id))
  .map((t) => t.identifier);

// --- Build type efficacy matrix ---
const efficacyMatrix = {};
for (const row of typeEfficacy) {
  if (!REAL_TYPE_IDS.has(row.damage_type_id) || !REAL_TYPE_IDS.has(row.target_type_id)) continue;
  const atk = typeById[row.damage_type_id];
  const def = typeById[row.target_type_id];
  if (!efficacyMatrix[atk]) efficacyMatrix[atk] = {};
  efficacyMatrix[atk][def] = Number(row.damage_factor) / 100;
}

// --- Build English species name map (language_id = 9) ---
const speciesNameById = {};
for (const row of pokemonSpeciesNames) {
  if (row.local_language_id === "9") speciesNameById[row.pokemon_species_id] = row.name;
}

// --- Build stats map: pokemon_id -> {hp, atk, def, spa, spd, spe} ---
const STAT_MAP = { "1": "hp", "2": "atk", "3": "def", "4": "spa", "5": "spd", "6": "spe" };
const statsById = {};
for (const row of pokemonStats) {
  if (!STAT_MAP[row.stat_id]) continue;
  if (!statsById[row.pokemon_id]) statsById[row.pokemon_id] = {};
  statsById[row.pokemon_id][STAT_MAP[row.stat_id]] = Number(row.base_stat);
}

// --- Build types map: pokemon_id -> [type1, type2?] ---
const typesById = {};
for (const row of pokemonTypes) {
  if (!REAL_TYPE_IDS.has(row.type_id)) continue;
  if (!typesById[row.pokemon_id]) typesById[row.pokemon_id] = [];
  typesById[row.pokemon_id][Number(row.slot) - 1] = typeById[row.type_id];
}

// --- Build species_id -> default pokemon_id map ---
const speciesDefaultPokemonId = {};
for (const p of pokemon) {
  if (p.is_default === "1") speciesDefaultPokemonId[p.species_id] = p.id;
}

// --- Build game availability sets ---
const championsSpecies = new Set(
  pokemonDexNumbers.filter((r) => r.pokedex_id === "36").map((r) => r.species_id)
);
const championsPokemonIds = new Set(
  [...championsSpecies].map((sid) => speciesDefaultPokemonId[sid]).filter(Boolean)
);

// --- Build species_id -> mega forms map ---
// e.g. "charizard-mega-x" with base slug "charizard" → label "Mega X"
function megaLabel(identifier, baseSlug) {
  const suffix = identifier.slice(baseSlug.length + 1); // "mega", "mega-x", "mega-z", etc.
  return suffix.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function buildFormEntry(p) {
  const stats = statsById[p.id] || {};
  const { hp = 0, atk = 0, def = 0, spa = 0, spd = 0, spe = 0 } = stats;
  const types = (typesById[p.id] || []).filter(Boolean);
  return { id: Number(p.id), slug: p.identifier, types, hp, atk, def, spa, spd, spe, bst: hp + atk + def + spa + spd + spe };
}

// Group non-default mega forms by species_id
const megasBySpecies = {};
for (const p of pokemon) {
  if (p.is_default === "1") continue;
  if (!p.identifier.includes("mega")) continue;
  if (!championsSpecies.has(p.species_id)) continue;
  if (!megasBySpecies[p.species_id]) megasBySpecies[p.species_id] = [];
  const baseSlug = speciesDefaultPokemonId[p.species_id]
    ? pokemon.find((x) => x.id === speciesDefaultPokemonId[p.species_id])?.identifier
    : null;
  const label = baseSlug ? megaLabel(p.identifier, baseSlug) : "Mega";
  megasBySpecies[p.species_id].push({ ...buildFormEntry(p), label });
}

// --- Assemble Pokemon list (default forms, Champions only) ---
const pokemonList = pokemon
  .filter((p) => p.is_default === "1" && championsPokemonIds.has(p.id))
  .map((p) => {
    const stats = statsById[p.id] || {};
    const { hp = 0, atk = 0, def = 0, spa = 0, spd = 0, spe = 0 } = stats;
    const bst = hp + atk + def + spa + spd + spe;
    const name = speciesNameById[p.species_id] || p.identifier;
    const types = (typesById[p.id] || []).filter(Boolean);
    const megas = megasBySpecies[p.species_id] || [];
    return {
      id: Number(p.id),
      name,
      slug: p.identifier,
      types,
      hp, atk, def, spa, spd, spe, bst,
      seasons: ["m-1"],
      megas,
    };
  })
  .filter((p) => p.types.length > 0);

// --- Write output ---
writeFileSync(join(OUT_DIR, "pokemon.json"), JSON.stringify(pokemonList));
writeFileSync(join(OUT_DIR, "type-chart.json"), JSON.stringify({ types: realTypes, matrix: efficacyMatrix }));

const megaCount = pokemonList.filter((p) => p.megas.length > 0).length;
console.log(`Built ${pokemonList.length} Pokemon (${megaCount} with mega forms, Season M-1 only)`);
console.log(`Built type chart for ${realTypes.length} types`);
