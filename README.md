# Terra — GIS White-Label Sales Management Platform

A multi-tenant, white-label SaaS platform for real estate agencies to manage lot and subdivision sales through interactive GIS maps. Terra enables property developers and brokers to display available lots, track sales status, and capture leads — all fully customizable per agency brand.

## Features

- **Interactive GIS Map** — SVG-based map with drag, pan, pinch-to-zoom, and mouse-wheel zoom. Polygons are color-coded by status (available, under visit, reserved, sold).
- **KMZ/KML Parsing** — Upload or reference KMZ files; the platform parses KML placemarks and renders polygons with extracted metadata (area, perimeter, price).
- **White-Label Tenant System** — Centralized `tenant.ts` configuration file. Each agency gets its own color theme, logo, favicon, contact email, and default map coordinates. No hardcoded brand assets.
- **Dynamic Theming** — Tailwind CSS color tokens (`primary`, `secondary`, `accent`, `map-bg`) are bound to CSS custom properties and injected at runtime via `TenantProvider`. Changing a tenant instantly updates the entire UI.
- **Role-Based Sidebar** — Authenticated agents see a state selector to update lot status. Visitors see a lead capture form that sends inquiries to the agency's configured email.
- **Multi-Project Support** — Dropdown menu to switch between projects (subdivisions), each with its own KMZ data and geographic bounds.

## Tech Stack

| Layer        | Technology                                   |
|-------------|---------------------------------------------|
| Framework   | Next.js 14 (App Router)                     |
| Language    | TypeScript                                  |
| Styling     | Tailwind CSS + CSS Custom Properties        |
| Map         | Custom SVG renderer (no external map SDK)   |
| Data Layer  | Client-side KML parser + mock data          |
| Auth (WIP)  | Pluggable via NextAuth (tenant-scoped)      |
| State       | React Context + Hooks                       |

## Project Structure

```
src/
├── app/               # Next.js App Router pages & layout
│   ├── globals.css    # CSS variables (fallback values)
│   ├── layout.tsx     # Root layout with TenantProvider
│   └── page.tsx       # Main map page
├── components/        # UI components
│   ├── Header.tsx     # Sticky header with project dropdown & user icon
│   ├── MapContainer.tsx   # SVG map with pan/zoom/click interactions
│   ├── TerrainSidebar.tsx # Slide-out sidebar with lot details
│   └── ContactForm.tsx    # Visitor lead capture form
├── config/
│   └── tenant.ts      # Tenant definitions (brand, theme, contacts)
├── hooks/
│   └── useProjects.ts # Project state & KML fetching
├── lib/
│   ├── TenantProvider.tsx  # Runtime theme injection context
│   ├── kmlParser.ts        # KML/XML parser → Terreno[]
│   └── mockData.ts         # Sample subdivisions & lots
└── types/
    └── index.ts       # TypeScript interfaces
```

## Adding a New Tenant

Edit `src/config/tenant.ts` and add an entry:

```ts
'new-agency': {
  id: 'new-agency',
  companyName: 'New Agency',
  domain: 'new.terra-saas.com',
  assets: {
    logoUrl: '/logos/new-logo.svg',
    favicon: '/logos/new-favicon.ico',
    heroImage: '/heroes/new-hero.jpg',
  },
  theme: {
    primary: '#your-hex',
    secondary: '#your-hex',
    accent: '#your-hex',
    mapBackground: '#your-hex',
  },
  contactFormEmail: 'leads@new-agency.com',
  mapSettings: {
    lat: 25.0,
    lng: -100.0,
    defaultZoom: 15,
  },
}
```

No component modifications required.

## Getting Started

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:3000`. The default tenant is `inmobiliaria-alpha`. To switch tenants in development, update `NEXT_PUBLIC_TENANT_ID` in `.env.local`.

## Environment Variables

| Variable                   | Description                              |
|---------------------------|------------------------------------------|
| `NEXT_PUBLIC_TENANT_ID`   | Default tenant ID for local development  |
| `NEXT_PUBLIC_MAP_DATA_URL`| URL to the default KML/KMZ or GeoJSON    |
