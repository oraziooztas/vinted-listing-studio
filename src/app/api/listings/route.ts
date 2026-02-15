import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ListingSchema } from "@/types";
import { ZodError } from "zod";

// POST - Crea o aggiorna listing per un item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ListingSchema.parse(body);

    // Controlla se esiste già un listing per questo item
    const existing = await prisma.listing.findUnique({
      where: { itemId: validatedData.itemId },
    });

    let listing;

    if (existing) {
      // Aggiorna
      listing = await prisma.listing.update({
        where: { itemId: validatedData.itemId },
        data: validatedData,
      });
    } else {
      // Crea
      listing = await prisma.listing.create({
        data: validatedData,
      });
    }

    return NextResponse.json(listing, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dati non validi",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore nel salvataggio del listing" },
      { status: 500 }
    );
  }
}
