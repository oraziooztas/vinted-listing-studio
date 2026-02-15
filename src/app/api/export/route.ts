import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ConditionLabels, StatusLabels } from "@/types";
import type { Condition, Status } from "@/types";

// GET - Export dati
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formatType = searchParams.get("format") || "csv";
    const itemId = searchParams.get("itemId"); // Export singolo item

    let items;

    if (itemId) {
      // Export singolo
      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { listing: true },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Annuncio non trovato" },
          { status: 404 }
        );
      }

      items = [item];
    } else {
      // Export tutti
      items = await prisma.item.findMany({
        include: { listing: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (formatType === "csv") {
      return exportCsv(items);
    } else if (formatType === "md" || formatType === "txt") {
      return exportMarkdown(items, itemId !== null);
    }

    return NextResponse.json(
      { error: "Formato non supportato. Usa: csv, md, txt" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json(
      { error: "Errore nell'export" },
      { status: 500 }
    );
  }
}

interface ItemWithListing {
  id: string;
  category: string;
  title: string;
  author: string | null;
  isbn: string | null;
  brand: string | null;
  condition: string;
  createdAt: Date;
  listing: {
    seoTitle: string | null;
    shortDesc: string | null;
    longDesc: string | null;
    tagsCsv: string | null;
    priceQuick: number | null;
    priceMaxProfitMin: number | null;
    priceMaxProfitMax: number | null;
    status: string;
    publishedAt: Date | null;
    soldAt: Date | null;
    soldPrice: number | null;
  } | null;
}

function exportCsv(items: ItemWithListing[]) {
  const headers = [
    "ID",
    "Categoria",
    "Titolo",
    "Autore/Marca",
    "Condizione",
    "Titolo SEO",
    "Descrizione Breve",
    "Descrizione Lunga",
    "Tags",
    "Prezzo Vendita Veloce",
    "Prezzo Max Min",
    "Prezzo Max Max",
    "Stato",
    "Data Creazione",
    "Data Pubblicazione",
    "Data Vendita",
    "Prezzo Vendita",
  ];

  const rows = items.map((item) => [
    item.id,
    item.category,
    escapeCsv(item.title),
    escapeCsv(item.author || item.brand || ""),
    ConditionLabels[item.condition as Condition] || item.condition,
    escapeCsv(item.listing?.seoTitle || ""),
    escapeCsv(item.listing?.shortDesc || ""),
    escapeCsv(item.listing?.longDesc || ""),
    escapeCsv(item.listing?.tagsCsv || ""),
    item.listing?.priceQuick?.toString() || "",
    item.listing?.priceMaxProfitMin?.toString() || "",
    item.listing?.priceMaxProfitMax?.toString() || "",
    StatusLabels[(item.listing?.status as Status) || "bozza"],
    format(item.createdAt, "dd/MM/yyyy", { locale: it }),
    item.listing?.publishedAt
      ? format(item.listing.publishedAt, "dd/MM/yyyy", { locale: it })
      : "",
    item.listing?.soldAt
      ? format(item.listing.soldAt, "dd/MM/yyyy", { locale: it })
      : "",
    item.listing?.soldPrice?.toString() || "",
  ]);

  const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vinted-export-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv"`,
    },
  });
}

function exportMarkdown(items: ItemWithListing[], singleItem: boolean) {
  const sections = items.map((item) => {
    const lines: string[] = [];

    lines.push(`# ${item.listing?.seoTitle || item.title}`);
    lines.push("");

    if (item.author) {
      lines.push(`**Autore:** ${item.author}`);
    }
    if (item.brand) {
      lines.push(`**Marca:** ${item.brand}`);
    }
    lines.push(
      `**Condizione:** ${
        ConditionLabels[item.condition as Condition] || item.condition
      }`
    );
    lines.push("");

    if (item.listing?.shortDesc) {
      lines.push("## Descrizione Breve");
      lines.push(item.listing.shortDesc);
      lines.push("");
    }

    if (item.listing?.longDesc) {
      lines.push("## Descrizione Completa");
      lines.push(item.listing.longDesc);
      lines.push("");
    }

    if (item.listing?.tagsCsv) {
      lines.push("## Tags");
      lines.push(item.listing.tagsCsv);
      lines.push("");
    }

    if (item.listing?.priceQuick) {
      lines.push("## Prezzi Consigliati");
      lines.push(`- Vendita veloce: €${item.listing.priceQuick}`);
      if (item.listing.priceMaxProfitMin && item.listing.priceMaxProfitMax) {
        lines.push(
          `- Massimo profitto: €${item.listing.priceMaxProfitMin} - €${item.listing.priceMaxProfitMax}`
        );
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("");

    return lines.join("\n");
  });

  const markdown = sections.join("\n");
  const filename = singleItem
    ? `annuncio-${items[0].id}.md`
    : `vinted-export-${format(new Date(), "yyyy-MM-dd")}.md`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
