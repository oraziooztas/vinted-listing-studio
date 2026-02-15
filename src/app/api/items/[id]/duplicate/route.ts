import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - Duplica un item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Trova l'item originale
    const original = await prisma.item.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Annuncio non trovato" },
        { status: 404 }
      );
    }

    // Crea una copia dell'item (senza id e date)
    const { id: _id, createdAt, updatedAt, listing, ...itemData } = original;

    const newItem = await prisma.item.create({
      data: {
        ...itemData,
        title: `${itemData.title} (copia)`,
      },
    });

    // Se c'era un listing, crea anche una copia del listing
    if (listing) {
      const {
        id: _listingId,
        itemId: _itemId,
        createdAt: _lCreatedAt,
        updatedAt: _lUpdatedAt,
        publishedAt,
        soldAt,
        soldPrice,
        ...listingData
      } = listing;

      await prisma.listing.create({
        data: {
          ...listingData,
          itemId: newItem.id,
          status: "bozza", // Reset a bozza
        },
      });
    }

    // Ritorna il nuovo item con listing
    const result = await prisma.item.findUnique({
      where: { id: newItem.id },
      include: { listing: true },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/items/[id]/duplicate error:", error);
    return NextResponse.json(
      { error: "Errore nella duplicazione dell'annuncio" },
      { status: 500 }
    );
  }
}
