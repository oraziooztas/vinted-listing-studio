import type {
  Style,
  Tone,
  Condition,
  Category,
  GeneratedTexts,
  GeneratedMessages,
  ConditionLabels,
} from "@/types";

// Mapping condizioni per descrizioni
const conditionDescriptions: Record<Condition, Record<Style, string>> = {
  nuovo: {
    neutro: "Nuovo, mai utilizzato, con cartellino originale.",
    cordiale: "Completamente nuovo, ancora con il cartellino! Mai indossato.",
    minimal: "Nuovo con cartellino.",
    premium:
      "Articolo nuovo di zecca, completo di cartellino originale. Mai utilizzato.",
  },
  come_nuovo: {
    neutro: "In condizioni pari al nuovo, utilizzato pochissime volte.",
    cordiale: "Praticamente nuovo! Usato solo un paio di volte.",
    minimal: "Come nuovo, usato pochissimo.",
    premium:
      "In condizioni eccellenti, praticamente indistinguibile dal nuovo. Utilizzato in rare occasioni.",
  },
  ottimo: {
    neutro: "In ottime condizioni, ben tenuto e curato.",
    cordiale: "Tenuto benissimo! Vedrai che è in ottime condizioni.",
    minimal: "Ottime condizioni.",
    premium:
      "Mantenuto in ottime condizioni, con cura e attenzione ai dettagli.",
  },
  buono: {
    neutro: "In buone condizioni generali, presenta normali segni d'uso.",
    cordiale:
      "In buone condizioni, con qualche segno d'uso che racconta la sua storia.",
    minimal: "Buone condizioni, segni d'uso.",
    premium:
      "In buone condizioni complessive, con segni d'uso compatibili con un utilizzo regolare.",
  },
  usato: {
    neutro: "Presenta segni d'uso evidenti ma è ancora perfettamente funzionale.",
    cordiale:
      "Ha i suoi segni d'uso, ma funziona perfettamente! Prezzo onesto per questo.",
    minimal: "Usato, funzionale.",
    premium:
      "Articolo usato con segni visibili, ma strutturalmente integro e funzionale.",
  },
  da_sistemare: {
    neutro: "Necessita di piccole riparazioni o sistemazioni.",
    cordiale:
      "Ha bisogno di un po' di amore e qualche sistemazione. Prezzo tenuto basso per questo!",
    minimal: "Da sistemare.",
    premium:
      "Richiede interventi di manutenzione o riparazione. Prezzo adeguato alle condizioni.",
  },
};

// Frasi di apertura per stile
const openingPhrases: Record<Style, string[]> = {
  neutro: [
    "Vendo",
    "In vendita",
    "Metto in vendita",
    "Propongo",
  ],
  cordiale: [
    "Ciao! Vendo",
    "Vendo con dispiacere",
    "Metto in vendita",
    "Cerco nuova casa per",
  ],
  minimal: ["Vendo", "In vendita", "Disponibile"],
  premium: [
    "Propongo in vendita",
    "Offro",
    "Metto a disposizione",
    "Presento in vendita",
  ],
};

// Frasi di chiusura per stile
const closingPhrases: Record<Style, string[]> = {
  neutro: [
    "Contattatemi per informazioni.",
    "Disponibile per domande.",
    "Per info scrivetemi.",
  ],
  cordiale: [
    "Scrivimi pure per qualsiasi domanda!",
    "Sono disponibile per foto aggiuntive o info!",
    "Non esitare a contattarmi!",
  ],
  minimal: ["Info in privato.", "Contattare per info."],
  premium: [
    "Resto a disposizione per ulteriori dettagli e foto su richiesta.",
    "Per qualsiasi informazione aggiuntiva, non esitate a contattarmi.",
  ],
};

// Info spedizione per stile
const shippingPhrases: Record<Style, string> = {
  neutro: "Spedizione disponibile in tutta Italia.",
  cordiale: "Spedisco in tutta Italia, ben imballato!",
  minimal: "Spedizione Italia.",
  premium:
    "Spedizione accurata e protetta disponibile su tutto il territorio nazionale.",
};

// Genera un elemento random da un array
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Genera titolo SEO ottimizzato
export function generateSeoTitle(
  title: string,
  author: string | null,
  brand: string | null,
  category: Category,
  condition: Condition
): string {
  const parts: string[] = [];

  // Per libri: Titolo - Autore
  if (category === "libro") {
    parts.push(title);
    if (author) {
      parts.push(author);
    }
  } else {
    // Per altri: Brand + Titolo
    if (brand) {
      parts.push(brand);
    }
    parts.push(title);
  }

  // Aggiungi condizione solo se non è "usato" generico
  if (condition === "nuovo" || condition === "come_nuovo") {
    parts.push(condition === "nuovo" ? "NUOVO" : "Come nuovo");
  }

  // Unisci e tronca a 60 caratteri
  let result = parts.join(" - ");
  if (result.length > 60) {
    result = result.substring(0, 57) + "...";
  }

  return result;
}

// Genera descrizione breve
export function generateShortDesc(
  title: string,
  category: Category,
  condition: Condition,
  style: Style,
  defects: string[] = []
): string {
  const opening = randomPick(openingPhrases[style]);
  const condDesc = conditionDescriptions[condition][style];

  let desc = `${opening} ${title.toLowerCase()}. ${condDesc}`;

  if (defects.length > 0 && style !== "minimal") {
    desc += ` Presenta: ${defects.slice(0, 2).join(", ")}.`;
  }

  // Tronca a 250 caratteri
  if (desc.length > 250) {
    desc = desc.substring(0, 247) + "...";
  }

  return desc;
}

// Genera descrizione lunga
export function generateLongDesc(
  title: string,
  author: string | null,
  brand: string | null,
  category: Category,
  condition: Condition,
  style: Style,
  tone: Tone,
  defects: string[] = [],
  defectNotes: string | null = null,
  color: string | null = null,
  size: string | null = null,
  material: string | null = null,
  notes: string | null = null
): string {
  const paragraphs: string[] = [];

  // Paragrafo 1: Introduzione
  const opening = randomPick(openingPhrases[style]);
  let intro = `${opening} `;

  if (category === "libro") {
    intro += `"${title}"`;
    if (author) {
      intro += ` di ${author}`;
    }
    intro += ".";
  } else {
    if (brand) {
      intro += `${brand} - `;
    }
    intro += `${title}.`;
  }

  paragraphs.push(intro);

  // Paragrafo 2: Dettagli prodotto
  const details: string[] = [];
  if (color) details.push(`Colore: ${color}`);
  if (size) details.push(`Taglia/Misura: ${size}`);
  if (material) details.push(`Materiale: ${material}`);

  if (details.length > 0) {
    paragraphs.push(details.join(" | "));
  }

  // Paragrafo 3: Condizioni
  paragraphs.push(conditionDescriptions[condition][style]);

  // Paragrafo 4: Difetti (se presenti)
  if (defects.length > 0 || defectNotes) {
    let defectParagraph = "";

    if (tone === "formale") {
      defectParagraph = "Si segnalano i seguenti difetti: ";
    } else if (tone === "informale") {
      defectParagraph = "Ti segnalo che presenta: ";
    } else {
      defectParagraph = "Difetti da segnalare: ";
    }

    if (defects.length > 0) {
      defectParagraph += defects.join(", ");
    }

    if (defectNotes) {
      defectParagraph += `. ${defectNotes}`;
    }

    paragraphs.push(defectParagraph);
  }

  // Paragrafo 5: Note aggiuntive
  if (notes) {
    paragraphs.push(notes);
  }

  // Paragrafo 6: Spedizione
  paragraphs.push(shippingPhrases[style]);

  // Paragrafo 7: Chiusura
  paragraphs.push(randomPick(closingPhrases[style]));

  return paragraphs.join("\n\n");
}

// Genera tags/keywords
export function generateTags(
  title: string,
  author: string | null,
  brand: string | null,
  category: Category,
  condition: Condition,
  color: string | null,
  material: string | null
): string[] {
  const tags: string[] = [];

  // Parole dal titolo (max 3)
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);
  tags.push(...titleWords);

  // Categoria
  tags.push(category);

  // Autore o brand
  if (author) {
    tags.push(author.toLowerCase().split(" ")[0]);
  }
  if (brand) {
    tags.push(brand.toLowerCase());
  }

  // Condizione
  if (condition === "nuovo") tags.push("nuovo");
  if (condition === "come_nuovo") tags.push("come nuovo");

  // Colore e materiale
  if (color) tags.push(color.toLowerCase());
  if (material) tags.push(material.toLowerCase());

  // Tags generici
  if (category === "libro") {
    tags.push("libri", "lettura");
  } else {
    tags.push("usato", "seconda mano");
  }

  // Rimuovi duplicati e limita a 12
  const uniqueTags = Array.from(new Set(tags)).slice(0, 12);

  return uniqueTags;
}

// Genera tutti i testi
export function generateAllTexts(
  title: string,
  author: string | null,
  brand: string | null,
  category: Category,
  condition: Condition,
  style: Style,
  tone: Tone,
  defects: string[] = [],
  defectNotes: string | null = null,
  color: string | null = null,
  size: string | null = null,
  material: string | null = null,
  notes: string | null = null
): GeneratedTexts {
  return {
    seoTitle: generateSeoTitle(title, author, brand, category, condition),
    shortDesc: generateShortDesc(title, category, condition, style, defects),
    longDesc: generateLongDesc(
      title,
      author,
      brand,
      category,
      condition,
      style,
      tone,
      defects,
      defectNotes,
      color,
      size,
      material,
      notes
    ),
    tags: generateTags(title, author, brand, category, condition, color, material),
  };
}

// ---- GENERAZIONE MESSAGGI ----

// Messaggi disponibilità
const availabilityMessages: Record<Tone, string[]> = {
  informale: [
    "Ciao! Sì, è ancora disponibile. Ti interessa?",
    "Ehi! Ancora disponibile, fammi sapere se lo vuoi!",
    "Sì sì, c'è ancora! Dimmi pure.",
  ],
  standard: [
    "Buongiorno, sì l'articolo è ancora disponibile. Per qualsiasi domanda sono a disposizione.",
    "Salve, confermo che è ancora disponibile. Posso aiutarla con altre informazioni?",
    "L'articolo è ancora disponibile. Mi faccia sapere se ha altre domande.",
  ],
  formale: [
    "Buongiorno, confermo la disponibilità dell'articolo. Resto a disposizione per eventuali chiarimenti.",
    "Gentile cliente, l'articolo è attualmente disponibile. Per ulteriori informazioni, non esiti a contattarmi.",
  ],
};

// Messaggi sconto
const discountMessages: Record<Tone, string[]> = {
  informale: [
    "Guarda, il prezzo è già buono ma posso scendere un pochino. Fammi una proposta!",
    "Per te posso fare un piccolo sconto, dimmi quanto vorresti spendere.",
    "Il prezzo è quello, ma se prendi subito posso venire un po' incontro!",
  ],
  standard: [
    "Il prezzo indicato è già competitivo, ma sono disponibile a valutare un piccolo margine di trattativa.",
    "Grazie per l'interesse. Il prezzo ha un minimo margine di trattabilità per acquisti immediati.",
    "Posso valutare una piccola riduzione. Mi faccia sapere la sua proposta.",
  ],
  formale: [
    "La ringrazio per l'interesse. Il prezzo esposto riflette il valore dell'articolo, tuttavia sono disponibile a considerare proposte ragionevoli.",
    "Il prezzo è stato calibrato in modo equo. Per acquisti immediati, posso valutare un margine di trattativa contenuto.",
  ],
};

// Messaggi spedizione
const shippingMessages: Record<Tone, string[]> = {
  informale: [
    "Spedisco con Poste o corriere, come preferisci! Di solito in 1-2 giorni parte.",
    "Appena paghi, spedisco! Tracciato e ben imballato, tranquillo.",
    "Spedizione veloce, ti mando il tracking appena parte!",
  ],
  standard: [
    "Spedisco entro 1-2 giorni lavorativi dal pagamento. Utilizzo spedizione tracciata. Le invierò il codice di tracking.",
    "La spedizione avviene tramite corriere o Poste Italiane con tracciamento. Tempi di consegna stimati: 3-5 giorni.",
    "Spedizione con imballaggio accurato e tracking. Riceverà gli aggiornamenti sulla spedizione.",
  ],
  formale: [
    "La spedizione viene effettuata entro 48 ore dalla conferma del pagamento, tramite corriere espresso con tracking. I tempi di consegna sono generalmente di 3-5 giorni lavorativi.",
    "Procederò alla spedizione con imballaggio protettivo e servizio tracciato. Le fornirò tempestivamente il codice di tracciamento per monitorare la consegna.",
  ],
};

// Messaggi prenotazione
const reservationMessages: Record<Tone, string[]> = {
  informale: [
    "Ok, te lo tengo da parte per 24 ore! Fammi sapere poi.",
    "Va bene, riservato per te! Ti aspetto.",
    "Lo blocco per te, ma fammi sapere entro domani!",
  ],
  standard: [
    "Posso riservare l'articolo per 24-48 ore. Mi faccia sapere quando potrà procedere con l'acquisto.",
    "L'articolo è riservato a suo nome. La prenotazione ha validità di 48 ore.",
    "Ho annotato la sua prenotazione. Attendo conferma per procedere.",
  ],
  formale: [
    "L'articolo viene riservato a Suo nome per un massimo di 48 ore. Al termine di tale periodo, in assenza di conferma, sarà nuovamente disponibile.",
    "Confermo la prenotazione dell'articolo. Resto in attesa di Sua comunicazione per finalizzare l'acquisto entro 48 ore.",
  ],
};

// Messaggi problema
const problemMessages: Record<Tone, string[]> = {
  informale: [
    "Mi dispiace che ci sia stato un problema! Dimmi tutto e troviamo una soluzione insieme.",
    "Oh no, mi dispiace! Raccontami cosa è successo e vediamo come sistemare.",
    "Capisco, scusa per il disagio. Vediamo come posso aiutarti!",
  ],
  standard: [
    "Mi dispiace per l'inconveniente. Può descrivermi il problema? Troveremo sicuramente una soluzione.",
    "Grazie per avermi contattato. Sono dispiaciuto per la situazione e pronto a risolvere il problema insieme.",
    "Mi scuso per il disagio. La prego di descrivere il problema così potrò assisterla al meglio.",
  ],
  formale: [
    "La ringrazio per la segnalazione e mi scuso per l'inconveniente. La prego di fornirmi dettagli sul problema riscontrato affinché possa provvedere a una soluzione adeguata.",
    "Mi rammarico per la situazione verificatasi. Sono a completa disposizione per analizzare il problema e trovare una risoluzione soddisfacente per entrambe le parti.",
  ],
};

// Genera tutti i messaggi
export function generateAllMessages(tone: Tone): GeneratedMessages {
  return {
    availability: randomPick(availabilityMessages[tone]),
    discount: randomPick(discountMessages[tone]),
    shipping: randomPick(shippingMessages[tone]),
    reservation: randomPick(reservationMessages[tone]),
    problem: randomPick(problemMessages[tone]),
  };
}

// Rigenera solo un tipo di messaggio
export function regenerateMessage(
  type: keyof GeneratedMessages,
  tone: Tone
): string {
  const messageMap = {
    availability: availabilityMessages,
    discount: discountMessages,
    shipping: shippingMessages,
    reservation: reservationMessages,
    problem: problemMessages,
  };

  return randomPick(messageMap[type][tone]);
}
