# DEVLOG

Log cronologico di decisioni, problemi e lezioni per questo progetto.

---

## [2026-02-18] — Sync docs iniziale

**Cosa fatto:**
- Applicazione Next.js 14 completa per creare annunci Vinted ottimizzati
- Stack: Next.js 14, Prisma + SQLite, Vitest per testing, shadcn/ui, lucide-react
- Schema Prisma ricco con 4 modelli: Item, Listing, Settings, IsbnCache
- Funzionalità ISBN lookup per libri (OpenLibrary/Google Books con cache DB)
- Generatore testi per annunci con 4 stili (neutro/cordiale/minimal/premium) e 3 toni
- Template messaggi per risposte comuni (disponibilità, sconto, spedizione, prenotazione, problema)
- Calcolatore prezzi con fasce: quick sale, max profit range, con urgency/rarity sliders
- API REST completa: /items, /listings, /isbn, /settings, /dashboard, /export
- Test suite con Vitest (price-calculator.test.ts, text-generator.test.ts)
- Supporto LLM opzionale (template | anthropic | openai) configurabile da Settings

**Decisioni prese:**
- SQLite per semplicità — tool personale, non multi-utente
- Pattern item -> listing separati per tenere dati oggetto e dati annuncio distinti
- Cache ISBN in DB per evitare chiamate API ripetute con scadenza configurabile
- LLM opzionale: di default usa template pre-scritti, può usare AI se l'utente inserisce API key

**Problemi incontrati:**
- Nessuno (sync iniziale)

**Lezioni apprese:**
- Il design dual-model (Item + Listing) permette di modificare i testi generati senza toccare i dati dell'oggetto
- La gestione dei difetti come JSON array (`defectsJson`) evita migrazioni per nuovi tipi di difetto

**Prossimi passi:**
- Verificare lo stato dell'app (funzionante o in sviluppo?)
- Aggiungere upload immagini reali (ora `imagesJson` e' solo paths)
- Implementare export CSV per tracking vendite
