import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ItemSchema } from "@/types";
import { ZodError } from "zod";

// GET - Ottieni singolo item con listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Annuncio non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/items/[id] error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dell'annuncio" },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = ItemSchema.partial().parse(body);

    const item = await prisma.item.update({
      where: { id },
      data: validatedData,
      include: {
        listing: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/items/[id] error:", error);

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
      { error: "Errore nell'aggiornamento dell'annuncio" },
      { status: 500 }
    );
  }
}

// DELETE - Elimina item e listing associato
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/items/[id] error:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'annuncio" },
      { status: 500 }
    );
  }
}
