import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SettingsSchema } from "@/types";
import { ZodError } from "zod";
import crypto from "crypto";

// Funzione per hashare il PIN
function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

// GET - Ottieni settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    // Se non esistono settings, creali con valori default
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 1 },
      });
    }

    // Non ritornare pinHash o apiKey completi per sicurezza
    return NextResponse.json({
      ...settings,
      pinHash: settings.pinHash ? "***" : null,
      isbnApiKey: settings.isbnApiKey ? "***" : null,
      llmApiKey: settings.llmApiKey ? "***" : null,
      hasPin: !!settings.pinHash,
      hasIsbnApiKey: !!settings.isbnApiKey,
      hasLlmApiKey: !!settings.llmApiKey,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle impostazioni" },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Gestione speciale per il PIN
    let pinHash = undefined;
    if (body.pin !== undefined) {
      if (body.pin === "" || body.pin === null) {
        pinHash = null; // Rimuovi PIN
      } else if (body.pin.length >= 4) {
        pinHash = hashPin(body.pin);
      }
      delete body.pin;
    }

    // Valida altri campi
    const { pinHash: _ph, ...restBody } = body;
    const validatedData = SettingsSchema.partial().parse(restBody);

    // Costruisci dati da aggiornare
    const updateData: Record<string, unknown> = { ...validatedData };
    if (pinHash !== undefined) {
      updateData.pinHash = pinHash;
    }

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData },
    });

    return NextResponse.json({
      ...settings,
      pinHash: settings.pinHash ? "***" : null,
      isbnApiKey: settings.isbnApiKey ? "***" : null,
      llmApiKey: settings.llmApiKey ? "***" : null,
      hasPin: !!settings.pinHash,
      hasIsbnApiKey: !!settings.isbnApiKey,
      hasLlmApiKey: !!settings.llmApiKey,
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);

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
      { error: "Errore nell'aggiornamento delle impostazioni" },
      { status: 500 }
    );
  }
}

// POST - Verifica PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { error: "PIN richiesto" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings?.pinHash) {
      // Nessun PIN impostato, accesso libero
      return NextResponse.json({ valid: true });
    }

    const inputHash = hashPin(pin);
    const valid = inputHash === settings.pinHash;

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: "Errore nella verifica del PIN" },
      { status: 500 }
    );
  }
}
