import { NextRequest, NextResponse } from "next/server";
import { lookupIsbn } from "@/lib/isbn-lookup";
import { prisma } from "@/lib/db";
import { IsbnProviderEnum } from "@/types";

// GET - Cerca informazioni ISBN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get("isbn");

    if (!isbn) {
      return NextResponse.json(
        { error: "ISBN richiesto" },
        { status: 400 }
      );
    }

    // Ottieni settings per provider
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    const provider = settings?.isbnProvider || "openlibrary";
    const validProvider = IsbnProviderEnum.safeParse(provider);

    if (!validProvider.success) {
      return NextResponse.json(
        { error: "Provider ISBN non valido" },
        { status: 400 }
      );
    }

    const result = await lookupIsbn(
      isbn,
      validProvider.data,
      settings?.isbnApiKey || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result.data,
      fromCache: result.fromCache,
    });
  } catch (error) {
    console.error("GET /api/isbn error:", error);
    return NextResponse.json(
      { error: "Errore nella ricerca ISBN" },
      { status: 500 }
    );
  }
}
