# MAP — Project Overview

> App locale Next.js per creare annunci Vinted ottimizzati: inserisci un articolo (con ISBN per libri), genera titolo SEO, descrizione e messaggi template, calcola il prezzo ottimale.

## Struttura

```
vinted-listing-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard principale
│   │   ├── annunci/
│   │   │   ├── nuovo/page.tsx   # Form creazione nuovo annuncio
│   │   │   └── [id]/page.tsx    # Dettaglio/edit annuncio
│   │   ├── settings/page.tsx    # Configurazione LLM, stili default, ISBN provider
│   │   └── api/
│   │       ├── items/           # CRUD items + duplicate
│   │       ├── listings/        # CRUD listings
│   │       ├── isbn/            # Lookup ISBN con cache
│   │       ├── settings/        # Get/update settings
│   │       ├── dashboard/       # Stats aggregate
│   │       └── export/          # Export dati
│   ├── components/
│   │   ├── ui/                  # shadcn/ui: button, input, card, dialog, badge, tabs, toast, slider, checkbox, select
│   │   └── copy-button.tsx
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── price-calculator.ts  # Calcolo fasce prezzo (quick/max-profit)
│   │   ├── text-generator.ts    # Generatore testi annuncio
│   │   ├── isbn-lookup.ts       # OpenLibrary/Google Books + cache
│   │   └── utils.ts
│   ├── types/index.ts
│   └── __tests__/
│       ├── price-calculator.test.ts
│       └── text-generator.test.ts
├── prisma/
│   ├── schema.prisma            # Item, Listing, Settings, IsbnCache
│   └── seed.ts
├── package.json
└── node_modules/
```

## File chiave

| File | Cosa fa |
|------|---------|
| `prisma/schema.prisma` | Schema DB: Item (articolo), Listing (annuncio+prezzi+messaggi), Settings (LLM config), IsbnCache |
| `src/lib/text-generator.ts` | Genera titolo SEO (max 60 char), descrizione breve (250 char), lunga (paragrafi), tag (max 12), messaggi template |
| `src/lib/price-calculator.ts` | Calcola priceQuick e range priceMaxProfitMin/Max in base a pricePaid, yearBought, urgency, rarity |
| `src/lib/isbn-lookup.ts` | Lookup dati libro da ISBN (OpenLibrary o Google Books) con cache SQLite |
| `src/app/api/dashboard/route.ts` | Stats: totale annunci, venduti, incasso, media prezzi |

## Entry Points

| Azione | Comando |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Test | `npm run test` |
| Migrazione DB | `npm run db:migrate` |
| Seed DB | `npm run db:seed` |
| Prisma Studio | `npm run db:studio` |

## Convenzioni

- **Linguaggio:** TypeScript
- **Stile:** Tailwind CSS 3 + shadcn/ui
- **Database:** SQLite via Prisma (locale, file-based)
- **Deploy:** Locale (tool personale — non pensato per deploy)

## Note

- LLM opzionale: default usa template, ma supporta Anthropic/OpenAI se l'utente inserisce API key in Settings
- Pattern Item -> Listing: l'item e' l'oggetto fisico, il listing e' l'annuncio (modificabile senza toccare l'item)
- `defectsJson` e `imagesJson` sono stringhe JSON per flessibilita' senza migrazioni
- Stili annuncio: neutro, cordiale, minimal, premium — toni: informale, standard, formale
