import type {
  Condition,
  Category,
  PriceCalculationInput,
  ComparablePrice,
} from "@/types";

// Moltiplicatori per condizione
const conditionMultipliers: Record<Condition, number> = {
  nuovo: 0.85, // 85% del prezzo originale
  come_nuovo: 0.70, // 70%
  ottimo: 0.55, // 55%
  buono: 0.40, // 40%
  usato: 0.25, // 25%
  da_sistemare: 0.10, // 10%
};

// Moltiplicatori per urgenza (1 = molto urgente, 5 = nessuna fretta)
// Più urgente = prezzo più basso
const urgencyMultipliers: Record<number, number> = {
  1: 0.70, // Molto urgente - sconto 30%
  2: 0.80, // Urgente - sconto 20%
  3: 0.90, // Normale - sconto 10%
  4: 0.95, // Poca fretta - sconto 5%
  5: 1.00, // Nessuna fretta - prezzo pieno
};

// Moltiplicatori per rarità (1 = molto comune, 5 = molto raro)
const rarityMultipliers: Record<number, number> = {
  1: 0.80, // Molto comune - penalità 20%
  2: 0.90, // Comune - penalità 10%
  3: 1.00, // Normale
  4: 1.15, // Raro - bonus 15%
  5: 1.30, // Molto raro - bonus 30%
};

// Prezzi base per categoria se non abbiamo prezzo originale
const basePrices: Record<Category, number> = {
  libro: 8, // Prezzo base libro usato
  altro: 15, // Prezzo base oggetto generico
};

// Deprezzamento annuale (% persa per anno)
const yearlyDepreciation = 0.05; // 5% per anno

export interface PriceResult {
  quickSalePrice: number; // Prezzo vendita veloce
  maxProfitMin: number; // Range massimo profitto - minimo
  maxProfitMax: number; // Range massimo profitto - massimo
  suggestedPrice: number; // Prezzo suggerito (media)
  negotiable: boolean; // Consigliato trattabile
  confidence: "alta" | "media" | "bassa"; // Affidabilità stima
  notes: string[]; // Note per l'utente
}

/**
 * Calcola il prezzo suggerito basandosi su un modello euristico
 */
export function calculatePrice(input: PriceCalculationInput): PriceResult {
  const {
    condition,
    pricePaid,
    yearBought,
    urgency,
    rarity,
    comparables,
    category,
  } = input;

  const notes: string[] = [];
  let confidence: "alta" | "media" | "bassa" = "media";
  let basePrice: number;

  // 1. Determina il prezzo base
  if (comparables && comparables.length > 0) {
    // Se abbiamo comparabili, usiamo quelli come riferimento principale
    const avgComparable = calculateComparableAverage(comparables, condition);
    basePrice = avgComparable;
    confidence = comparables.length >= 2 ? "alta" : "media";
    notes.push(
      `Prezzo basato su ${comparables.length} articoli simili.`
    );
  } else if (pricePaid && pricePaid > 0) {
    // Usa il prezzo pagato come base
    basePrice = pricePaid;
    notes.push("Prezzo basato sul costo originale.");
  } else {
    // Usa prezzo base per categoria
    basePrice = basePrices[category];
    confidence = "bassa";
    notes.push(
      "Stima basata su prezzi medi di categoria. Aggiungi comparabili per una stima migliore."
    );
  }

  // 2. Applica moltiplicatore condizione
  const conditionPrice = basePrice * conditionMultipliers[condition];

  // 3. Applica deprezzamento per anno
  let depreciatedPrice = conditionPrice;
  if (yearBought) {
    const currentYear = new Date().getFullYear();
    const yearsOld = currentYear - yearBought;
    if (yearsOld > 0) {
      const depreciation = Math.min(yearsOld * yearlyDepreciation, 0.5); // Max 50% deprezzamento
      depreciatedPrice = conditionPrice * (1 - depreciation);
      if (yearsOld > 3) {
        notes.push(`Applicato deprezzamento per ${yearsOld} anni di età.`);
      }
    }
  }

  // 4. Calcola prezzo vendita veloce (applica urgenza)
  const quickSalePrice = Math.max(
    Math.round(depreciatedPrice * urgencyMultipliers[urgency]),
    1
  );

  // 5. Calcola range massimo profitto (applica rarità)
  const profitBase = depreciatedPrice * rarityMultipliers[rarity];
  const maxProfitMin = Math.max(Math.round(profitBase * 0.9), quickSalePrice);
  const maxProfitMax = Math.max(
    Math.round(profitBase * 1.2),
    maxProfitMin + 1
  );

  // 6. Prezzo suggerito (punto medio)
  const suggestedPrice = Math.round((quickSalePrice + maxProfitMin) / 2);

  // 7. Determina se trattabile
  const priceRange = maxProfitMax - quickSalePrice;
  const negotiable = priceRange > 5; // Trattabile se c'è margine > 5€

  // 8. Note aggiuntive basate sui parametri
  if (urgency <= 2) {
    notes.push("Urgenza alta: prezzo aggressivo per vendita rapida.");
  }
  if (rarity >= 4) {
    notes.push("Articolo raro: margine di prezzo più alto.");
  }
  if (condition === "nuovo" || condition === "come_nuovo") {
    notes.push("Ottime condizioni: valore ben mantenuto.");
  }
  if (negotiable) {
    notes.push("Consigliato: indica il prezzo come trattabile.");
  }

  return {
    quickSalePrice,
    maxProfitMin,
    maxProfitMax,
    suggestedPrice,
    negotiable,
    confidence,
    notes,
  };
}

/**
 * Calcola la media ponderata dei prezzi comparabili
 * considerando la differenza di condizione
 */
function calculateComparableAverage(
  comparables: ComparablePrice[],
  targetCondition: Condition
): number {
  const conditionOrder: Condition[] = [
    "nuovo",
    "come_nuovo",
    "ottimo",
    "buono",
    "usato",
    "da_sistemare",
  ];

  const targetIndex = conditionOrder.indexOf(targetCondition);

  let totalWeight = 0;
  let weightedSum = 0;

  for (const comp of comparables) {
    let weight = 1;

    // Se il comparabile ha una condizione, aggiusta il prezzo
    if (comp.condition) {
      const compIndex = conditionOrder.indexOf(comp.condition);
      const diff = compIndex - targetIndex;

      // Se il comparabile è in condizioni migliori, il nostro vale meno
      // Se è in condizioni peggiori, il nostro vale di più
      const adjustment = diff * 0.1; // 10% per ogni livello di differenza
      weight = 1 + adjustment;
    }

    weightedSum += comp.price * weight;
    totalWeight += 1;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Formatta il prezzo per la visualizzazione
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Suggerisce un prezzo di partenza per la trattativa
 */
export function suggestStartingPrice(result: PriceResult): number {
  // Parti dal massimo se vuoi margine, altrimenti dal suggerito
  if (result.negotiable) {
    return result.maxProfitMin;
  }
  return result.suggestedPrice;
}
