import { describe, it, expect } from "vitest";
import { calculatePrice, formatPrice } from "@/lib/price-calculator";

describe("Price Calculator", () => {
  describe("calculatePrice", () => {
    it("calcola prezzi base per condizione nuovo", () => {
      const result = calculatePrice({
        condition: "nuovo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      expect(result.quickSalePrice).toBeGreaterThan(0);
      expect(result.maxProfitMin).toBeGreaterThanOrEqual(result.quickSalePrice);
      expect(result.maxProfitMax).toBeGreaterThanOrEqual(result.maxProfitMin);
    });

    it("calcola prezzi più bassi per condizione usato", () => {
      const resultNuovo = calculatePrice({
        condition: "nuovo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      const resultUsato = calculatePrice({
        condition: "usato",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      expect(resultUsato.quickSalePrice).toBeLessThan(resultNuovo.quickSalePrice);
    });

    it("applica urgenza alta per prezzo più basso", () => {
      const resultNormale = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      const resultUrgente = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: null,
        urgency: 1,
        rarity: 3,
        category: "altro",
      });

      expect(resultUrgente.quickSalePrice).toBeLessThan(resultNormale.quickSalePrice);
    });

    it("applica rarità alta per prezzo più alto", () => {
      const resultComune = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 1,
        category: "altro",
      });

      const resultRaro = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 5,
        category: "altro",
      });

      expect(resultRaro.maxProfitMax).toBeGreaterThan(resultComune.maxProfitMax);
    });

    it("usa prezzo base categoria se manca prezzo pagato", () => {
      const result = calculatePrice({
        condition: "ottimo",
        pricePaid: null,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "libro",
      });

      expect(result.quickSalePrice).toBeGreaterThan(0);
      expect(result.confidence).toBe("bassa");
    });

    it("considera prezzi comparabili quando forniti", () => {
      const resultSenzaComparabili = calculatePrice({
        condition: "ottimo",
        pricePaid: null,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      const resultConComparabili = calculatePrice({
        condition: "ottimo",
        pricePaid: null,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
        comparables: [
          { price: 50, notes: "venduto ieri" },
          { price: 45, notes: "venduto settimana scorsa" },
        ],
      });

      expect(resultConComparabili.confidence).not.toBe("bassa");
      expect(resultConComparabili.quickSalePrice).toBeGreaterThan(
        resultSenzaComparabili.quickSalePrice
      );
    });

    it("imposta negotiable in base al range di prezzo", () => {
      const result = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: null,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      // Se c'è un range significativo, dovrebbe essere trattabile
      const range = result.maxProfitMax - result.quickSalePrice;
      expect(result.negotiable).toBe(range > 5);
    });

    it("applica deprezzamento per anno", () => {
      const currentYear = new Date().getFullYear();

      const resultRecente = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: currentYear - 1,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      const resultVecchio = calculatePrice({
        condition: "ottimo",
        pricePaid: 100,
        yearBought: currentYear - 10,
        urgency: 3,
        rarity: 3,
        category: "altro",
      });

      expect(resultVecchio.quickSalePrice).toBeLessThan(resultRecente.quickSalePrice);
    });

    it("restituisce note appropriate", () => {
      const result = calculatePrice({
        condition: "nuovo",
        pricePaid: null,
        yearBought: null,
        urgency: 1,
        rarity: 5,
        category: "altro",
      });

      expect(result.notes.length).toBeGreaterThan(0);
      expect(result.notes.some((n) => n.includes("urgenza") || n.includes("raro"))).toBe(
        true
      );
    });
  });

  describe("formatPrice", () => {
    it("formatta il prezzo in euro italiano", () => {
      const formatted = formatPrice(10.5);
      expect(formatted).toContain("10");
      expect(formatted).toContain("€");
    });

    it("gestisce prezzi interi", () => {
      const formatted = formatPrice(25);
      expect(formatted).toContain("25");
    });

    it("gestisce decimali", () => {
      const formatted = formatPrice(15.99);
      expect(formatted).toContain("15");
      expect(formatted).toContain("99");
    });
  });
});
