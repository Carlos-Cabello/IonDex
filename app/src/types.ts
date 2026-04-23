export interface PokemonForm {
  id: number;
  slug: string;
  types: string[];
  abilities: string[];
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  bst: number;
}

export interface MegaForm extends PokemonForm {
  label: string;
}

export interface Pokemon {
  id: number;
  name: string;
  slug: string;
  types: string[];
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  bst: number;
  abilities: string[];
  seasons: string[];
  megas: MegaForm[];
  forms: PokemonForm[];
}

export interface Season {
  key: string;
  label: string;
}

export const SEASONS: Season[] = [
  { key: "m-1", label: "Season M-1" },
];

export type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP",
  atk: "Attack",
  def: "Defense",
  spa: "Sp. Atk",
  spd: "Sp. Def",
  spe: "Speed",
};
