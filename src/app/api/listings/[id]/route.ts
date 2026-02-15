import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ListingSchema, StatusEnum } from "@/types";
import { ZodError } from "zod";

// GET - Ottieni listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del listing" },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = ListingSchema.partial().parse(body);

    // Gestisci cambio stato
    if (validatedData.status) {
      StatusEnum.parse(validatedData.status);

      if (validatedData.status === "pubblicato" && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }

      if (validatedData.status === "venduto" && !validatedData.soldAt) {
        validatedData.soldAt = new Date();
      }
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("PUT /api/listings/[id] error:", error);

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
      { error: "Errore nell'aggiornamento del listing" },
      { status: 500 }
    );
  }
}
