# Vinted Listing Studio

A web application for creating and managing Vinted marketplace listings quickly and consistently. Catalog items, generate SEO-optimized titles and descriptions, calculate data-driven pricing, and prepare buyer response templates -- all backed by a local SQLite database.

## Features

- **3-Step Listing Wizard:** Guided flow to create complete, ready-to-publish listings
- **SEO Content Generation:** Auto-generate optimized titles (max 60 chars), short descriptions (max 250 chars), full descriptions, and up to 12 tags
- **Heuristic Pricing Model:** Calculate quick-sale and max-profit price ranges based on condition, urgency, rarity, depreciation, and comparable listings
- **Buyer Response Templates:** Pre-written messages for five common scenarios (availability, discount requests, shipping, reservations, issue reports)
- **ISBN Book Lookup:** Automatic metadata fetching for books via OpenLibrary or Google Books with 30-day caching and rate limiting
- **Listing Lifecycle:** Track items through draft, published, and sold stages with timestamps and sale prices
- **Dashboard with KPIs:** Overview of total listings, sales, average selling time, and average price
- **Quick Copy:** One-click copy for any section of a listing
- **Export:** CSV and Markdown export for all listings
- **Configurable Text Styles:** Four styles (neutral, friendly, minimal, premium) and three tones (informal, standard, formal)
- **Optional LLM Integration:** Use template engine (default, no API key) or connect Anthropic/OpenAI for advanced text generation
- **PIN Protection:** Optional basic access protection

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite via Prisma ORM 5
- **Validation:** Zod
- **UI Components:** Radix UI (Dialog, Dropdown Menu, Select, Tabs, Checkbox, Slider, Toast, Tooltip)
- **Icons:** Lucide React
- **Date Utilities:** date-fns
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js >= 18

### Installation

```bash
git clone <repository-url>
cd vinted-listing-studio
npm install
```

### Database Setup

```bash
# Create database and apply schema
npx prisma db push

# Seed with demo data (optional)
npm run db:seed
```

### Configuration

Create a `.env` file:

```bash
# Database (required)
DATABASE_URL="file:./dev.db"

# LLM Provider (optional -- for advanced text generation)
# LLM_PROVIDER="anthropic"  # or "openai"
# ANTHROPIC_API_KEY="sk-..."
# OPENAI_API_KEY="sk-..."

# Google Books API (optional -- for ISBN lookup)
# GOOGLE_BOOKS_API_KEY="..."
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test

# Tests in watch mode
npm run test:watch
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run db:push` | Apply Prisma schema |
| `npm run db:migrate` | Create Prisma migration |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
vinted-listing-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Dashboard with KPIs
│   │   ├── annunci/                 # Listing management pages (wizard, detail, edit)
│   │   ├── settings/                # App settings page
│   │   └── api/                     # API routes (items, listings, settings, ISBN lookup)
│   ├── components/
│   │   ├── ui/                      # Reusable UI components (shadcn/ui)
│   │   └── copy-button.tsx          # Copy-to-clipboard button
│   ├── lib/                         # Prisma client, utilities
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── __tests__/                   # Unit tests (pricing, text generation)
├── prisma/
│   ├── schema.prisma                # Database schema (Item, Listing, Settings, IsbnCache)
│   ├── seed.ts                      # Database seed script
│   └── dev.db                       # SQLite database file
├── package.json
└── tsconfig.json
```

### Database Schema

- **Item:** Product data (title, category, condition, brand/author, ISBN, color, size, material, weight, images, purchase info)
- **Listing:** Generated content (SEO title, descriptions, tags, pricing, 5 response templates, status, sale data)
- **Settings:** App configuration (PIN, ISBN provider, default style/tone, LLM provider)
- **IsbnCache:** Cached ISBN lookup results with expiration dates

## Pricing Model

The heuristic pricing model considers:

- **Condition:** Multiplier from new (highest) to needs-repair (lowest)
- **Original price paid** and **year of purchase** (5% annual depreciation)
- **Urgency to sell** (1-5 scale)
- **Perceived rarity** (1-5 scale)
- **Comparable prices** (up to 3 manually entered)

Output includes a quick-sale price, a max-profit range (min-max), and a negotiable flag.

## Notes

- No scraping of Vinted or any other platform is performed.
- The app is a single-user local tool -- no complex authentication required.
- The SQLite database is stored as a local file (`dev.db`), making the app fully self-contained.
- ISBN lookup uses only public APIs with rate limiting (1 request/second) and 30-day caching.
- Tests cover pricing calculations (multipliers, urgency, rarity, comparables) and text generation (titles, descriptions, tags, messages).

## License

MIT
