# Vinted Listing Studio

Una web app per creare annunci Vinted in modo veloce e consistente.

## Funzionalità

- **Wizard 3 step** per creare annunci completi
- **Generazione automatica** di titoli SEO, descrizioni e tag
- **Calcolo prezzi** con modello euristico (vendita veloce / massimo profitto)
- **Template messaggi** per rispondere agli acquirenti
- **ISBN Lookup** automatico per libri (Open Library / Google Books)
- **Storico annunci** con stati (Bozza / Pubblicato / Venduto)
- **Export** CSV e Markdown
- **Dashboard** con KPI (annunci, vendite, tempo medio, prezzo medio)
- **Copia rapida** di ogni sezione con un click

## Stack Tecnologico

- Next.js 14 (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Prisma + SQLite (database locale)
- Zod per validazione

## Installazione

```bash
# Clona il repository
git clone <repo-url>
cd vinted-listing-studio

# Installa le dipendenze
npm install

# Crea il database e applica lo schema
npx prisma db push

# (Opzionale) Popola con dati demo
npm run db:seed

# Avvia in development
npm run dev
```

L'app sarà disponibile su http://localhost:3000

## Comandi Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia in modalità development |
| `npm run build` | Build per produzione |
| `npm run start` | Avvia build di produzione |
| `npm run lint` | Esegue ESLint |
| `npm run test` | Esegue test unitari |
| `npm run test:watch` | Test in watch mode |
| `npm run db:push` | Applica schema Prisma |
| `npm run db:migrate` | Crea migrazione Prisma |
| `npm run db:seed` | Popola database con dati demo |
| `npm run db:studio` | Apre Prisma Studio |

## Configurazione

### Variabili d'ambiente (.env)

```bash
# Database (obbligatorio)
DATABASE_URL="file:./dev.db"

# LLM Provider (opzionale - per generazione testi avanzata)
# LLM_PROVIDER="anthropic" # oppure "openai"
# ANTHROPIC_API_KEY="sk-..."
# OPENAI_API_KEY="sk-..."

# Google Books API (opzionale - per ISBN lookup)
# GOOGLE_BOOKS_API_KEY="..."
```

### Impostazioni In-App

Vai su **Impostazioni** per configurare:

- **PIN protezione** - Protegge l'accesso all'app (opzionale)
- **Provider ISBN** - Open Library (gratuito) o Google Books
- **Stili predefiniti** - Stile e tono default per nuovi annunci
- **Provider LLM** - Template Engine (predefinito) o API esterna

## Generazione Testi

Il sistema supporta due modalità:

### 1. Template Engine (Default)

Genera testi usando regole e template predefiniti. Funziona offline senza API esterne.

Stili disponibili:
- **Neutro** - Descrizioni standard e professionali
- **Cordiale** - Tono amichevole e personale
- **Minimal** - Essenziale, poche parole
- **Premium** - Sofisticato e curato

Toni disponibili:
- **Informale** - Tu, linguaggio casual
- **Standard** - Equilibrato
- **Formale** - Lei, linguaggio professionale

### 2. Provider LLM (Opzionale)

Configura una API key Anthropic o OpenAI per generazione avanzata.

## ISBN Lookup

La ricerca ISBN funziona con:

- **Open Library** (default) - API gratuita, nessuna chiave richiesta
- **Google Books** - API key opzionale per più richieste

Implementa:
- Rate limiting (1 richiesta/secondo)
- Cache 30 giorni in database
- Fallback graceful se lookup fallisce

## Calcolo Prezzi

Il modello euristico considera:

- **Condizione** dell'oggetto (nuovo → da sistemare)
- **Prezzo pagato** originale (se fornito)
- **Anno acquisto** (deprezzamento annuale 5%)
- **Urgenza** di vendita (1-5)
- **Rarità** percepita (1-5)
- **Prezzi comparabili** inseriti manualmente (max 3)

Output:
- Prezzo **vendita veloce** (aggressivo)
- Range **massimo profitto** (min-max)
- Indicazione **trattabile** si/no
- Note e suggerimenti

## Struttura Database

```
Item
├── id, category, title, author, isbn, brand
├── condition, defects, color, size, material
├── pricePaid, yearBought, notes, images
└── listing → Listing

Listing
├── id, itemId, style, tone
├── seoTitle, shortDesc, longDesc, tagsCsv
├── messages (5 template)
├── priceQuick, priceMaxProfitMin/Max, negotiable
├── status (bozza/pubblicato/venduto)
└── dates (created, published, sold)

Settings
├── pinHash, isbnProvider, isbnApiKey
├── defaultStyle, defaultTone
└── llmProvider, llmApiKey
```

## Export

### CSV
Esporta tutti gli annunci con:
- Titolo, descrizioni, tag
- Prezzi consigliati
- Categoria, condizione, stato
- Date

### Markdown
Esporta singolo annuncio o tutti in formato `.md` pronto per copia.

## Test

```bash
# Esegui tutti i test
npm run test

# Watch mode
npm run test:watch
```

Test coprono:
- Calcolo prezzi (moltiplicatori, urgenza, rarità, comparabili)
- Generazione testi (titoli, descrizioni, tag, messaggi)

## Note Importanti

- **Nessun scraping** di Vinted o altri siti
- App **single-user locale** (nessuna autenticazione complessa)
- Database SQLite **locale** (file `dev.db`)
- ISBN lookup usa solo **API pubbliche** con rate limiting

## License

MIT
