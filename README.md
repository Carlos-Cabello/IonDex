# IonDex

A competitive Pokémon reference tool for **Pokémon Champions**. Quickly look up type matchups and base stats for every Pokémon in the current season.

## Features

- **Type matchups** — offensive and defensive coverage at a glance
- **Base stats** with BST, color-coded by value
- **Mega evolution toggle** on cards where applicable
- **Season filter** — scoped to the current competitive season (Season M-1)
- **Type filter** — narrow by one or more types
- **Stat filter** — minimum BST slider
- **Pin lists** — click any card to pin it; supports multiple named lists for side-by-side comparison

## Live site

Deployed to GitHub Pages on every push to `main`.

## Local development

**Prerequisites:** Node.js 20+, and a local clone of [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi) at `../data/` relative to this repo root (i.e. `../data/data/v2/csv/` must exist).

```bash
# 1. Build the JSON data files from PokeAPI CSVs
node scripts/build-data.js

# 2. Install dependencies and start the dev server
cd app
npm install
npm run dev
```

## Project structure

```
scripts/
  build-data.js       Node script that reads PokeAPI CSVs and writes
                      app/public/data/pokemon.json and type-chart.json
app/
  public/data/        Pre-built JSON data (committed, updated by build script)
  src/
    types.ts          Core TypeScript interfaces
    typeColors.ts     Type → color/text mappings
    App.tsx           Root component, filter state, pin list logic
    components/
      PokemonCard.tsx
      TypeMatchupChart.tsx
      Filters.tsx
  vite.config.ts
.github/workflows/
  deploy.yml          GitHub Actions: build data → build app → deploy to Pages
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs on every push to `main`:

1. Installs Node 20 and runs `npm ci` in `app/`
2. Runs `node scripts/build-data.js` to regenerate JSON data
3. Builds the Vite app with the correct `base` path for GitHub Pages
4. Deploys `app/dist/` via `actions/deploy-pages`

No manual configuration needed beyond enabling GitHub Pages (Settings → Pages → Source: GitHub Actions).
