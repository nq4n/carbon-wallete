# Carbon Wallet 🌿💳
Track your carbon footprint like a wallet: log activities, estimate CO₂e, set budgets, and see where your emissions come from.

## What it does
Carbon Wallet helps users:
- Estimate CO₂e from daily actions (transport, electricity, food, purchases)
- See totals by day/week/month
- Set a “carbon budget” and track progress
- Get tips to reduce footprint (optional)
- Export reports (CSV/PDF) (optional)

## Key Features
- ✅ Activity logging (manual + presets)
- ✅ CO₂e calculation engine (factors per category)
- ✅ Dashboard + charts (trends, categories, top sources)
- ✅ Carbon budget + alerts
- ✅ User accounts & cloud sync (optional)
- ✅ Offline-first mode (optional)

## How CO₂e is calculated (simple)
Each activity maps to an emission factor:
`CO₂e = activity_amount × emission_factor`

Examples:
- Driving: `km × (kgCO₂e/km)`
- Electricity: `kWh × (kgCO₂e/kWh)`
- Food: `servings × (kgCO₂e/serving)`

> Emission factors live in `/data/emission_factors.*` and can be updated per region.

## Tech Stack (edit this)
- Frontend: (React / Next.js / Flutter / etc.)
- Backend: (Flask / Django / Node / etc.)
- Database: (SQLite / Postgres / MongoDB / Supabase)
- Auth: (JWT / Supabase Auth / Firebase Auth)

## Project Structure
