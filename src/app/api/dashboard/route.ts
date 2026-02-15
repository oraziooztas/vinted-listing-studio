import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { DashboardKpi } from "@/types";

// GET - Statistiche dashboard
export async function GET() {
  try {
    // Conta totali
    const totalItems = await prisma.item.count();

    // Conta per stato
    const draftItems = await prisma.listing.count({
      where: { status: "bozza" },
    });

    const publishedItems = await prisma.listing.count({
      where: { status: "pubblicato" },
    });

    const soldItems = await prisma.listing.count({
      where: { status: "venduto" },
    });

    // Items senza listing = bozze non ancora completate
    const itemsWithoutListing = await prisma.item.count({
      where: { listing: null },
    });

    // Prezzo medio vendita
    const soldListings = await prisma.listing.findMany({
      where: {
        status: "venduto",
        soldPrice: { not: null },
      },
      select: {
        soldPrice: true,
        publishedAt: true,
        soldAt: true,
      },
    });

    let avgSalePrice: number | null = null;
    let avgDaysToSell: number | null = null;

    if (soldListings.length > 0) {
      // Media prezzi
      const totalPrice = soldListings.reduce(
        (sum, l) => sum + (l.soldPrice || 0),
        0
      );
      avgSalePrice = Math.round((totalPrice / soldListings.length) * 100) / 100;

      // Media giorni per vendere
      const salesWithDates = soldListings.filter(
        (l) => l.publishedAt && l.soldAt
      );
      if (salesWithDates.length > 0) {
        const totalDays = salesWithDates.reduce((sum, l) => {
          const published = new Date(l.publishedAt!);
          const sold = new Date(l.soldAt!);
          const days = Math.ceil(
            (sold.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + Math.max(days, 0);
        }, 0);
        avgDaysToSell = Math.round(totalDays / salesWithDates.length);
      }
    }

    const kpi: DashboardKpi = {
      totalItems,
      draftItems: draftItems + itemsWithoutListing,
      publishedItems,
      soldItems,
      avgSalePrice,
      avgDaysToSell,
    };

    return NextResponse.json(kpi);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle statistiche" },
      { status: 500 }
    );
  }
}
