import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ItemSchema } from "@/types";
import { ZodError } from "zod";

// GET - Lista tutti gli items con listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.listing = { status };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            status: true,
            seoTitle: true,
            shortDesc: true,
            priceQuick: true,
            publishedAt: true,
            soldAt: true,
            soldPrice: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero degli annunci" },
      { status: 500 }
    );
  }
}

// POST - Crea nuovo item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ItemSchema.parse(body);

    const item = await prisma.item.create({
      data: validatedData,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/items error:", error);

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
      { error: "Errore nella creazione dell'annuncio" },
      { status: 500 }
    );
  }
}
