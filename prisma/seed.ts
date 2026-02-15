import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Crea settings predefinite
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isbnProvider: "openlibrary",
      defaultStyle: "cordiale",
      defaultTone: "standard",
      llmProvider: "template",
    },
  });

  console.log("Created default settings");

  // Annuncio demo 1: Libro
  const item1 = await prisma.item.create({
    data: {
      category: "libro",
      title: "Il nome della rosa",
      author: "Umberto Eco",
      isbn: "9788845292613",
      publisher: "Bompiani",
      publishYear: 1980,
      language: "Italiano",
      condition: "ottimo",
      defectsJson: JSON.stringify(["pagine ingiallite"]),
      defectNotes: "Lieve ingiallimento delle pagine dovuto al tempo",
      pricePaid: 15.0,
      yearBought: 2018,
      notes: "Edizione tascabile, prima stampa.",
    },
  });

  await prisma.listing.create({
    data: {
      itemId: item1.id,
      style: "cordiale",
      tone: "standard",
      seoTitle: "Il nome della rosa - Umberto Eco - Ottimo stato",
      shortDesc:
        "Vendo Il nome della rosa di Umberto Eco. In ottime condizioni, ben tenuto e curato. Presenta: pagine ingiallite.",
      longDesc: `Vendo "Il nome della rosa" di Umberto Eco.

Edizione tascabile Bompiani, prima stampa del 1980.

In ottime condizioni, ben tenuto e curato.

Difetti da segnalare: pagine ingiallite. Lieve ingiallimento delle pagine dovuto al tempo.

Spedisco in tutta Italia, ben imballato!

Scrivimi pure per qualsiasi domanda!`,
      tagsCsv:
        "nome, rosa, umberto, eco, libro, bompiani, classico, giallo, storico",
      messageAvailability:
        "Salve, confermo che è ancora disponibile. Posso aiutarla con altre informazioni?",
      messageDiscount:
        "Grazie per l'interesse. Il prezzo ha un minimo margine di trattabilità per acquisti immediati.",
      messageShipping:
        "Spedisco entro 1-2 giorni lavorativi dal pagamento. Utilizzo spedizione tracciata.",
      messageReservation:
        "Posso riservare l'articolo per 24-48 ore. Mi faccia sapere quando potrà procedere.",
      messageProblem:
        "Mi dispiace per l'inconveniente. Può descrivermi il problema? Troveremo sicuramente una soluzione.",
      urgency: 3,
      rarity: 3,
      priceQuick: 8,
      priceMaxProfitMin: 10,
      priceMaxProfitMax: 12,
      negotiable: true,
      status: "pubblicato",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 giorni fa
    },
  });

  console.log("Created demo item 1: Il nome della rosa");

  // Annuncio demo 2: Abbigliamento
  const item2 = await prisma.item.create({
    data: {
      category: "altro",
      title: "Giacca in pelle vintage",
      brand: "Schott NYC",
      condition: "buono",
      defectsJson: JSON.stringify(["usura", "graffi"]),
      defectNotes: "Usura sulle maniche, piccoli graffi sulla schiena",
      color: "Nero",
      size: "M",
      material: "Pelle",
      pricePaid: 250.0,
      yearBought: 2015,
      notes: "Giacca biker classica, stile iconico.",
    },
  });

  await prisma.listing.create({
    data: {
      itemId: item2.id,
      style: "premium",
      tone: "standard",
      seoTitle: "Schott NYC - Giacca in pelle vintage - Taglia M",
      shortDesc:
        "Propongo in vendita Schott NYC - Giacca in pelle vintage. In buone condizioni generali, presenta normali segni d'uso.",
      longDesc: `Propongo in vendita Schott NYC - Giacca in pelle vintage.

Colore: Nero | Taglia/Misura: M | Materiale: Pelle

In buone condizioni complessive, con segni d'uso compatibili con un utilizzo regolare.

Si segnalano i seguenti difetti: usura, graffi. Usura sulle maniche, piccoli graffi sulla schiena.

Giacca biker classica, stile iconico.

Spedizione accurata e protetta disponibile su tutto il territorio nazionale.

Resto a disposizione per ulteriori dettagli e foto su richiesta.`,
      tagsCsv:
        "giacca, pelle, vintage, schott, nyc, nero, biker, moto, leather",
      messageAvailability:
        "Buongiorno, sì l'articolo è ancora disponibile. Per qualsiasi domanda sono a disposizione.",
      messageDiscount:
        "Il prezzo indicato è già competitivo, ma sono disponibile a valutare un piccolo margine di trattativa.",
      messageShipping:
        "La spedizione avviene tramite corriere con tracciamento. Tempi di consegna stimati: 3-5 giorni.",
      messageReservation:
        "L'articolo è riservato a suo nome. La prenotazione ha validità di 48 ore.",
      messageProblem:
        "Grazie per avermi contattato. Sono dispiaciuto per la situazione e pronto a risolvere insieme.",
      urgency: 4,
      rarity: 4,
      priceQuick: 85,
      priceMaxProfitMin: 100,
      priceMaxProfitMax: 130,
      negotiable: true,
      status: "pubblicato",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 giorni fa
    },
  });

  console.log("Created demo item 2: Giacca in pelle");

  // Annuncio demo 3: Libro venduto
  const item3 = await prisma.item.create({
    data: {
      category: "libro",
      title: "1984",
      author: "George Orwell",
      isbn: "9788804668237",
      publisher: "Mondadori",
      publishYear: 1949,
      language: "Italiano",
      condition: "come_nuovo",
      pricePaid: 12.0,
      yearBought: 2022,
      notes: "Nuova traduzione.",
    },
  });

  await prisma.listing.create({
    data: {
      itemId: item3.id,
      style: "minimal",
      tone: "informale",
      seoTitle: "1984 - George Orwell - Come nuovo",
      shortDesc:
        "Vendo 1984 di George Orwell. Come nuovo, usato pochissimo.",
      longDesc: `Vendo "1984" di George Orwell.

Edizione Mondadori, nuova traduzione.

Come nuovo, usato pochissimo.

Spedizione Italia.

Info in privato.`,
      tagsCsv: "1984, orwell, george, libro, distopia, classico, mondadori",
      messageAvailability: "Ciao! Sì, è ancora disponibile. Ti interessa?",
      messageDiscount:
        "Guarda, il prezzo è già buono ma posso scendere un pochino. Fammi una proposta!",
      messageShipping:
        "Spedisco con Poste o corriere, come preferisci! Di solito in 1-2 giorni parte.",
      messageReservation: "Ok, te lo tengo da parte per 24 ore! Fammi sapere poi.",
      messageProblem:
        "Mi dispiace che ci sia stato un problema! Dimmi tutto e troviamo una soluzione insieme.",
      urgency: 2,
      rarity: 2,
      priceQuick: 7,
      priceMaxProfitMin: 8,
      priceMaxProfitMax: 10,
      negotiable: false,
      status: "venduto",
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 giorni fa
      soldAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 giorni fa
      soldPrice: 8,
    },
  });

  console.log("Created demo item 3: 1984 (venduto)");

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
