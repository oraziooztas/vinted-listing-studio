import { z } from "zod";

// Categorie
export const CategoryEnum = z.enum(["libro", "altro"]);
export type Category = z.infer<typeof CategoryEnum>;

// Condizioni
export const ConditionEnum = z.enum([
  "nuovo",
  "come_nuovo",
  "ottimo",
  "buono",
  "usato",
  "da_sistemare",
]);
export type Condition = z.infer<typeof ConditionEnum>;

export const ConditionLabels: Record<Condition, string> = {
  nuovo: "Nuovo con cartellino",
  come_nuovo: "Come nuovo",
  ottimo: "Ottimo stato",
  buono: "Buone condizioni",
  usato: "Usato",
  da_sistemare: "Da sistemare",
};

// Stili annuncio
export const StyleEnum = z.enum(["neutro", "cordiale", "minimal", "premium"]);
export type Style = z.infer<typeof StyleEnum>;

export const StyleLabels: Record<Style, string> = {
  neutro: "Neutro",
  cordiale: "Cordiale",
  minimal: "Minimal",
  premium: "Premium",
};

// Toni
export const ToneEnum = z.enum(["informale", "standard", "formale"]);
export type Tone = z.infer<typeof ToneEnum>;

export const ToneLabels: Record<Tone, string> = {
  informale: "Informale",
  standard: "Standard",
  formale: "Formale",
};

// Stati annuncio
export const StatusEnum = z.enum(["bozza", "pubblicato", "venduto"]);
export type Status = z.infer<typeof StatusEnum>;

export const StatusLabels: Record<Status, string> = {
  bozza: "Bozza",
  pubblicato: "Pubblicato",
  venduto: "Venduto",
};

// ISBN Providers
export const IsbnProviderEnum = z.enum([
  "openlibrary",
  "googlebooks",
  "disabled",
]);
export type IsbnProvider = z.infer<typeof IsbnProviderEnum>;

// LLM Providers
export const LlmProviderEnum = z.enum(["template", "anthropic", "openai"]);
export type LlmProvider = z.infer<typeof LlmProviderEnum>;

// Difetti comuni
export const CommonDefects = [
  "graffi",
  "macchie",
  "strappi",
  "usura",
  "colore sbiadito",
  "bottoni mancanti",
  "cerniera rotta",
  "cuciture allentate",
  "pagine ingiallite",
  "copertina rovinata",
  "sottolineature",
  "dedica",
] as const;

// Schema Item
export const ItemSchema = z.object({
  category: CategoryEnum,
  title: z.string().min(1, "Il titolo è obbligatorio").max(200),
  author: z.string().max(200).optional().nullable(),
  isbn: z.string().max(20).optional().nullable(),
  publisher: z.string().max(200).optional().nullable(),
  publishYear: z.number().int().min(1800).max(2100).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  condition: ConditionEnum,
  defectsJson: z.string().optional().nullable(),
  defectNotes: z.string().max(500).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  imagesJson: z.string().optional().nullable(),
  pricePaid: z.number().positive().optional().nullable(),
  yearBought: z.number().int().min(1950).max(2100).optional().nullable(),
});

export type ItemInput = z.infer<typeof ItemSchema>;

// Schema Listing
export const ListingSchema = z.object({
  itemId: z.string(),
  style: StyleEnum.default("neutro"),
  tone: ToneEnum.default("standard"),
  seoTitle: z.string().max(60).optional().nullable(),
  shortDesc: z.string().max(250).optional().nullable(),
  longDesc: z.string().max(5000).optional().nullable(),
  tagsCsv: z.string().max(500).optional().nullable(),
  messageAvailability: z.string().max(500).optional().nullable(),
  messageDiscount: z.string().max(500).optional().nullable(),
  messageShipping: z.string().max(500).optional().nullable(),
  messageReservation: z.string().max(500).optional().nullable(),
  messageProblem: z.string().max(500).optional().nullable(),
  urgency: z.number().int().min(1).max(5).default(3),
  rarity: z.number().int().min(1).max(5).default(3),
  comparablesJson: z.string().optional().nullable(),
  priceQuick: z.number().positive().optional().nullable(),
  priceMaxProfitMin: z.number().positive().optional().nullable(),
  priceMaxProfitMax: z.number().positive().optional().nullable(),
  negotiable: z.boolean().default(true),
  status: StatusEnum.default("bozza"),
  publishedAt: z.date().optional().nullable(),
  soldAt: z.date().optional().nullable(),
  soldPrice: z.number().positive().optional().nullable(),
});

export type ListingInput = z.infer<typeof ListingSchema>;

// Schema Settings
export const SettingsSchema = z.object({
  pinHash: z.string().optional().nullable(),
  isbnProvider: IsbnProviderEnum.default("openlibrary"),
  isbnApiKey: z.string().optional().nullable(),
  defaultStyle: StyleEnum.default("neutro"),
  defaultTone: ToneEnum.default("standard"),
  llmProvider: LlmProviderEnum.default("template"),
  llmApiKey: z.string().optional().nullable(),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

// Schema per ISBN lookup result
export const IsbnDataSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publishYear: z.number().optional(),
  language: z.string().optional(),
  pages: z.number().optional(),
  coverUrl: z.string().optional(),
});

export type IsbnData = z.infer<typeof IsbnDataSchema>;

// Schema per prezzi comparabili
export const ComparablePriceSchema = z.object({
  price: z.number().positive(),
  condition: ConditionEnum.optional(),
  notes: z.string().optional(),
});

export type ComparablePrice = z.infer<typeof ComparablePriceSchema>;

// Schema per calcolo prezzo input
export const PriceCalculationInputSchema = z.object({
  condition: ConditionEnum,
  pricePaid: z.number().positive().optional().nullable(),
  yearBought: z.number().int().optional().nullable(),
  urgency: z.number().int().min(1).max(5),
  rarity: z.number().int().min(1).max(5),
  comparables: z.array(ComparablePriceSchema).max(3).optional(),
  category: CategoryEnum,
});

export type PriceCalculationInput = z.infer<typeof PriceCalculationInputSchema>;

// Schema per testi generati
export const GeneratedTextsSchema = z.object({
  seoTitle: z.string(),
  shortDesc: z.string(),
  longDesc: z.string(),
  tags: z.array(z.string()),
});

export type GeneratedTexts = z.infer<typeof GeneratedTextsSchema>;

// Schema per messaggi generati
export const GeneratedMessagesSchema = z.object({
  availability: z.string(),
  discount: z.string(),
  shipping: z.string(),
  reservation: z.string(),
  problem: z.string(),
});

export type GeneratedMessages = z.infer<typeof GeneratedMessagesSchema>;

// Item con Listing per la dashboard
export interface ItemWithListing {
  id: string;
  category: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishYear: number | null;
  language: string | null;
  brand: string | null;
  condition: string;
  defectsJson: string | null;
  defectNotes: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  weight: number | null;
  notes: string | null;
  imagesJson: string | null;
  pricePaid: number | null;
  yearBought: number | null;
  createdAt: Date;
  updatedAt: Date;
  listing: {
    id: string;
    status: string;
    seoTitle: string | null;
    shortDesc: string | null;
    priceQuick: number | null;
    publishedAt: Date | null;
    soldAt: Date | null;
    soldPrice: number | null;
  } | null;
}

// KPI Dashboard
export interface DashboardKpi {
  totalItems: number;
  draftItems: number;
  publishedItems: number;
  soldItems: number;
  avgSalePrice: number | null;
  avgDaysToSell: number | null;
}
