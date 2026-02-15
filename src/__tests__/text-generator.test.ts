import { describe, it, expect } from "vitest";
import {
  generateSeoTitle,
  generateShortDesc,
  generateLongDesc,
  generateTags,
  generateAllTexts,
  generateAllMessages,
  regenerateMessage,
} from "@/lib/text-generator";

describe("Text Generator", () => {
  describe("generateSeoTitle", () => {
    it("genera titolo SEO per libro con autore", () => {
      const title = generateSeoTitle(
        "Il nome della rosa",
        "Umberto Eco",
        null,
        "libro",
        "ottimo"
      );

      expect(title).toContain("Il nome della rosa");
      expect(title).toContain("Umberto Eco");
      expect(title.length).toBeLessThanOrEqual(60);
    });

    it("genera titolo SEO per altro con brand", () => {
      const title = generateSeoTitle(
        "Giacca vintage",
        null,
        "Schott NYC",
        "altro",
        "buono"
      );

      expect(title).toContain("Schott NYC");
      expect(title).toContain("Giacca vintage");
      expect(title.length).toBeLessThanOrEqual(60);
    });

    it("aggiunge NUOVO per condizione nuovo", () => {
      const title = generateSeoTitle(
        "T-shirt basic",
        null,
        "Zara",
        "altro",
        "nuovo"
      );

      expect(title).toContain("NUOVO");
    });

    it("aggiunge Come nuovo per condizione come_nuovo", () => {
      const title = generateSeoTitle(
        "Libro test",
        "Autore Test",
        null,
        "libro",
        "come_nuovo"
      );

      expect(title.toLowerCase()).toContain("come nuovo");
    });

    it("tronca titoli troppo lunghi", () => {
      const longTitle =
        "Questo è un titolo molto molto molto molto lungo che supera i 60 caratteri";
      const title = generateSeoTitle(longTitle, "Autore", null, "libro", "ottimo");

      expect(title.length).toBeLessThanOrEqual(60);
      expect(title.endsWith("...")).toBe(true);
    });
  });

  describe("generateShortDesc", () => {
    it("genera descrizione breve entro 250 caratteri", () => {
      const desc = generateShortDesc(
        "Libro test",
        "libro",
        "ottimo",
        "neutro",
        []
      );

      expect(desc.length).toBeLessThanOrEqual(250);
      expect(desc.toLowerCase()).toContain("libro test");
    });

    it("include difetti nella descrizione", () => {
      const desc = generateShortDesc(
        "Giacca usata",
        "altro",
        "buono",
        "cordiale",
        ["graffi", "usura"]
      );

      expect(desc).toMatch(/graffi|usura/i);
    });

    it("varia lo stile in base al parametro", () => {
      const descNeutro = generateShortDesc(
        "Test",
        "altro",
        "ottimo",
        "neutro",
        []
      );
      const descMinimal = generateShortDesc(
        "Test",
        "altro",
        "ottimo",
        "minimal",
        []
      );

      // Le descrizioni dovrebbero essere diverse per stili diversi
      expect(descNeutro.length).toBeGreaterThan(descMinimal.length);
    });
  });

  describe("generateLongDesc", () => {
    it("genera descrizione lunga con tutti i paragrafi", () => {
      const desc = generateLongDesc(
        "Il nome della rosa",
        "Umberto Eco",
        null,
        "libro",
        "ottimo",
        "cordiale",
        "standard",
        ["pagine ingiallite"],
        "Lieve ingiallimento",
        null,
        null,
        null,
        "Prima edizione"
      );

      expect(desc).toContain("Il nome della rosa");
      expect(desc).toContain("Umberto Eco");
      expect(desc).toContain("pagine ingiallite");
      expect(desc).toContain("Prima edizione");
      expect(desc.split("\n\n").length).toBeGreaterThan(3);
    });

    it("include dettagli colore/taglia/materiale quando forniti", () => {
      const desc = generateLongDesc(
        "Giacca",
        null,
        "Schott",
        "altro",
        "buono",
        "premium",
        "formale",
        [],
        null,
        "Nero",
        "M",
        "Pelle",
        null
      );

      expect(desc).toContain("Nero");
      expect(desc).toContain("M");
      expect(desc).toContain("Pelle");
    });
  });

  describe("generateTags", () => {
    it("genera array di tag", () => {
      const tags = generateTags(
        "Il nome della rosa",
        "Umberto Eco",
        null,
        "libro",
        "ottimo",
        null,
        null
      );

      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.length).toBeLessThanOrEqual(12);
    });

    it("include categoria nei tag", () => {
      const tags = generateTags(
        "Test libro",
        "Autore",
        null,
        "libro",
        "ottimo",
        null,
        null
      );

      expect(tags).toContain("libro");
    });

    it("include colore e materiale quando forniti", () => {
      const tags = generateTags(
        "Giacca",
        null,
        "Nike",
        "altro",
        "buono",
        "Nero",
        "Cotone"
      );

      expect(tags).toContain("nero");
      expect(tags).toContain("cotone");
    });

    it("non include duplicati", () => {
      const tags = generateTags(
        "Libro libro libro",
        null,
        null,
        "libro",
        "ottimo",
        null,
        null
      );

      const uniqueTags = new Set(tags);
      expect(tags.length).toBe(uniqueTags.size);
    });
  });

  describe("generateAllTexts", () => {
    it("genera tutti i testi in una volta", () => {
      const texts = generateAllTexts(
        "Test prodotto",
        "Autore",
        null,
        "libro",
        "ottimo",
        "neutro",
        "standard",
        [],
        null,
        null,
        null,
        null,
        null
      );

      expect(texts).toHaveProperty("seoTitle");
      expect(texts).toHaveProperty("shortDesc");
      expect(texts).toHaveProperty("longDesc");
      expect(texts).toHaveProperty("tags");
      expect(texts.seoTitle.length).toBeGreaterThan(0);
      expect(texts.shortDesc.length).toBeGreaterThan(0);
      expect(texts.longDesc.length).toBeGreaterThan(0);
      expect(texts.tags.length).toBeGreaterThan(0);
    });
  });

  describe("generateAllMessages", () => {
    it("genera tutti i messaggi template", () => {
      const messages = generateAllMessages("standard");

      expect(messages).toHaveProperty("availability");
      expect(messages).toHaveProperty("discount");
      expect(messages).toHaveProperty("shipping");
      expect(messages).toHaveProperty("reservation");
      expect(messages).toHaveProperty("problem");

      Object.values(messages).forEach((msg) => {
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    it("varia i messaggi in base al tono", () => {
      const msgInformale = generateAllMessages("informale");
      const msgFormale = generateAllMessages("formale");

      // I messaggi formali tendono ad essere più lunghi e usare "Lei"
      expect(msgFormale.availability).not.toBe(msgInformale.availability);
    });
  });

  describe("regenerateMessage", () => {
    it("rigenera un singolo tipo di messaggio", () => {
      const msg1 = regenerateMessage("availability", "standard");
      expect(msg1.length).toBeGreaterThan(0);
    });

    it("rispetta il tono specificato", () => {
      const msgInformale = regenerateMessage("discount", "informale");
      const msgFormale = regenerateMessage("discount", "formale");

      // Dovrebbero essere diversi per tono diverso
      expect(msgInformale).not.toBe(msgFormale);
    });
  });
});
