# Voltaic Frontend

Nuxt 4 SPA for browsing and managing EV charging stations. Features an interactive map, user dashboards, company management, support tickets, and multi-language support.

## Tech Stack

- **Framework:** Nuxt 4 + Vue 3 + TypeScript
- **State:** Pinia stores
- **Styling:** Tailwind CSS 3 + shadcn-vue (New York style)
- **Maps:** MapLibre GL + Leaflet (clustering, geolocation)
- **i18n:** `@nuxtjs/i18n` — English, Portuguese, Spanish
- **UI:** Reka UI, Lucide icons, Embla Carousel, GSAP animations
- **Charts:** Chart.js + vue-chartjs
- **HTTP:** Direct fetch via composables
- **Auth:** JWT access + refresh tokens with cookie storage

## Setup

```bash
# Copy environment
cp .env.example .env

# Install dependencies
bun install
# or: npm install

# Start dev server
bun run dev
# or: npm run dev
```

The app starts on `http://localhost:5173`.

## Environment Variables

| Variable                     | Default                    | Description           |
|------------------------------|----------------------------|-----------------------|
| `NUXT_PUBLIC_API_BASE_URL`   | `http://0.0.0.0:3000`      | API base URL          |

## Project Structure

```
frontend/
├── app/
│   ├── app.vue                        Root component
│   ├── error.vue                      Error page
│   ├── assets/css/tailwind.css        Tailwind entry + CSS variables
│   ├── components/
│   │   ├── admin/                     Admin panel components
│   │   ├── cards/                     Reusable cards
│   │   ├── company/                   Company-specific components
│   │   ├── Dashboard/                 Dashboard widgets
│   │   ├── landing-page/              Landing page (Hero, FeatureCard)
│   │   ├── map/                       Map components
│   │   ├── modals/                    Modal dialogs
│   │   ├── Sidebar/                   Sidebar navigation
│   │   ├── stations/                  Station-related components
│   │   └── ui/                        shadcn-vue primitives (button, input, dialog, etc.)
│   ├── composables/
│   │   ├── useApi.ts                  API fetch wrapper
│   │   ├── useGeolocation.ts          Browser geolocation
│   │   ├── useMapClustering.ts        Marker clustering
│   │   ├── useMapFilters.ts           Filter state (connectors, availability)
│   │   ├── useMapInstance.ts          MapLibre instance management
│   │   ├── useMapLookingLocation.ts   Camera location tracking
│   │   ├── useMapMarkers.ts           Station markers
│   │   ├── useResponsive.ts           Breakpoint detection
│   │   ├── useStation.ts              Station data fetching
│   │   └── useTheme.ts               Dark/light mode toggle
│   ├── constants/
│   │   └── connectors.ts              Socket type definitions
│   ├── layouts/
│   │   ├── default.vue                Main app layout (nav + sidebar)
│   │   └── landing.vue                Landing page layout
│   ├── lib/
│   │   └── utils.ts                   cn() helper (tailwind-merge + clsx)
│   ├── middleware/
│   │   └── auth.global.ts             Global auth redirect middleware
│   ├── pages/
│   │   ├── index.vue                  Landing page
│   │   ├── login.vue                  Login form
│   │   ├── signup.vue                 Registration form
│   │   ├── map.vue                    Interactive charging station map
│   │   ├── recover-password.vue       Password recovery
│   │   ├── profile/                   User profile pages
│   │   ├── admin/
│   │   │   ├── index.vue              Admin dashboard
│   │   │   ├── users.vue              User management
│   │   │   ├── companies.vue          Company management
│   │   │   ├── stations.vue           Station management
│   │   │   └── tickets.vue            Ticket management
│   │   └── company/                   Company-specific pages
│   ├── stores/
│   │   ├── auth.ts                    Auth state (login, logout, token)
│   │   ├── user.ts                    Current user profile
│   │   ├── company.ts                 Company data
│   │   ├── station.ts                 Station data
│   │   ├── ticket.ts                  Support tickets
│   │   ├── usage.ts                   Charging sessions
│   │   ├── log.ts                     Activity logs
│   │   └── vehicle.ts                 User vehicles
│   ├── types/
│   │   ├── station.ts                 Station type definitions
│   │   ├── ticket.ts                  Ticket types
│   │   ├── usage.ts                   Usage session types
│   │   ├── user.ts                    User types
│   │   └── mapFilter.ts               Map filter types
│   └── utils/
│       ├── auth.ts                    Auth helpers
│       ├── constants.ts               App constants
│       └── navigation.ts              Nav link builders
├── i18n/locales/
│   ├── en.json                        English translations
│   ├── es.json                        Spanish translations
│   └── pt.json                        Portuguese translations
├── plugins/
│   └── locale.ts                      i18n plugin
├── public/                            Static assets (logos, images)
├── tests/
│   └── login-selenium.js              Selenium login E2E test
├── nuxt.config.ts                     Nuxt configuration
├── tailwind.config.cjs                Tailwind theme
├── components.json                    shadcn-vue configuration
└── eslint.config.mjs                  ESLint config
```

## Pages & Routes

| Route                  | Layout    | Auth     | Description |
|------------------------|-----------|----------|-------------|
| `/`                    | landing   | —        | Marketing landing page with GSAP animations |
| `/login`               | default   | —        | Login with remember-me |
| `/signup`              | default   | —        | Account registration |
| `/map`                 | default   | Required | Interactive charging station map with filters |
| `/recover-password`    | default   | —        | Password reset flow |
| `/profile`             | default   | Required | User profile, vehicles, favorites |
| `/admin`               | default   | admin    | Admin dashboard with charts and stats |
| `/admin/users`         | default   | admin    | CRUD user management + role assignment |
| `/admin/companies`     | default   | admin    | Company management + group assignment |
| `/admin/stations`      | default   | admin    | Station CRUD and telemetry |
| `/admin/tickets`       | default   | admin    | Support ticket management |
| `/company`             | default   | company-manager, worker | Company dashboard and station management |

## Key Features

### Interactive Map
- MapLibre GL with custom markers and clustering
- Filter stations by connector type, availability, and power
- Geolocation-based "stations near me"
- Station detail popup with real-time status

### Authentication
- JWT access + refresh token rotation
- Auto-refresh on token expiry
- Persistent sessions via cookies
- Role-based route guards

### Dashboard
- Company dashboard with station availability, usage stats, and ticket overview
- Admin dashboard with platform-wide metrics
- Weekly usage charts via Chart.js

### i18n
- English, Portuguese, and Spanish translations
- Browser language auto-detection
- Cookie-persisted language preference

### Dark Mode
- System-aware default with manual toggle
- Persistent preference via `@nuxtjs/color-mode`

### Profile
- Edit personal info and preferences
- Manage up to 4 vehicles per account
- Favorite stations quick-access list
- View charging history and active sessions

## Build & Deploy

```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Generate static site
bun run generate
```

## Nuxt Config Highlights

| Feature           | Details |
|-------------------|---------|
| Port              | `5173`  |
| CSS               | Tailwind + SweetAlert2 |
| Modules           | color-mode, shadcn-nuxt, tailwindcss, image, eslint, pinia, i18n |
| Component dirs    | Auto-import from `~/components/ui`, `~/components/cards`, `~/layouts`, etc. |
| i18n strategy     | `no_prefix` with browser detection + cookie fallback |
| Image domains     | `www.carlogos.org` |
| DevTools          | Enabled |
