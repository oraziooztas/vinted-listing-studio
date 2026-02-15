import type { IsbnData, IsbnProvider } from "@/types";
import { prisma } from "./db";

// Rate limiter semplice
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 secondo tra richieste

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}

// Pulisce ISBN da trattini e spazi
function cleanIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

// Lookup da Open Library
async function lookupOpenLibrary(isbn: string): Promise<IsbnData | null> {
  try {
    await rateLimit();

    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
      {
        headers: {
          "User-Agent": "VintedListingStudio/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Open Library API error:", response.status);
      return null;
    }

    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (!bookData) {
      return null;
    }

    const result: IsbnData = {
      title: bookData.title,
      author: bookData.authors?.[0]?.name,
      publisher: bookData.publishers?.[0]?.name,
      publishYear: bookData.publish_date
        ? parseInt(bookData.publish_date.match(/\d{4}/)?.[0] || "")
        : undefined,
      pages: bookData.number_of_pages,
      coverUrl: bookData.cover?.medium,
    };

    // Prova a ottenere la lingua dall'API works
    if (bookData.identifiers?.openlibrary?.[0]) {
      try {
        const workKey = bookData.identifiers.openlibrary[0];
        const workResponse = await fetch(
          `https://openlibrary.org${workKey}.json`
        );
        if (workResponse.ok) {
          const workData = await workResponse.json();
          if (workData.languages?.[0]?.key) {
            const langKey = workData.languages[0].key;
            result.language = langKey.replace("/languages/", "");
          }
        }
      } catch {
        // Ignora errori sulla lingua
      }
    }

    return result;
  } catch (error) {
    console.error("Open Library lookup error:", error);
    return null;
  }
}

// Lookup da Google Books
async function lookupGoogleBooks(
  isbn: string,
  apiKey?: string
): Promise<IsbnData | null> {
  try {
    await rateLimit();

    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const volumeInfo = data.items[0].volumeInfo;

    const result: IsbnData = {
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(", "),
      publisher: volumeInfo.publisher,
      publishYear: volumeInfo.publishedDate
        ? parseInt(volumeInfo.publishedDate.match(/\d{4}/)?.[0] || "")
        : undefined,
      language: volumeInfo.language,
      pages: volumeInfo.pageCount,
      coverUrl: volumeInfo.imageLinks?.thumbnail,
    };

    return result;
  } catch (error) {
    console.error("Google Books lookup error:", error);
    return null;
  }
}

// Controlla cache
async function checkCache(isbn: string): Promise<IsbnData | null> {
  try {
    const cached = await prisma.isbnCache.findUnique({
      where: { isbn },
    });

    if (cached && cached.expiresAt > new Date()) {
      return JSON.parse(cached.dataJson) as IsbnData;
    }

    // Rimuovi cache scaduta
    if (cached) {
      await prisma.isbnCache.delete({ where: { isbn } });
    }

    return null;
  } catch (error) {
    console.error("Cache check error:", error);
    return null;
  }
}

// Salva in cache
async function saveToCache(
  isbn: string,
  data: IsbnData,
  provider: string
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Cache per 30 giorni

    await prisma.isbnCache.upsert({
      where: { isbn },
      update: {
        dataJson: JSON.stringify(data),
        provider,
        expiresAt,
      },
      create: {
        isbn,
        dataJson: JSON.stringify(data),
        provider,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Cache save error:", error);
  }
}

export interface IsbnLookupResult {
  success: boolean;
  data?: IsbnData;
  error?: string;
  fromCache?: boolean;
}

/**
 * Cerca informazioni su un libro tramite ISBN
 */
export async function lookupIsbn(
  isbn: string,
  provider: IsbnProvider = "openlibrary",
  apiKey?: string
): Promise<IsbnLookupResult> {
  if (provider === "disabled") {
    return {
      success: false,
      error: "Lookup ISBN disabilitato nelle impostazioni.",
    };
  }

  const cleanedIsbn = cleanIsbn(isbn);

  // Valida formato ISBN
  if (cleanedIsbn.length !== 10 && cleanedIsbn.length !== 13) {
    return {
      success: false,
      error: "ISBN non valido. Deve essere di 10 o 13 cifre.",
    };
  }

  // Controlla cache
  const cached = await checkCache(cleanedIsbn);
  if (cached) {
    return {
      success: true,
      data: cached,
      fromCache: true,
    };
  }

  // Esegui lookup
  let data: IsbnData | null = null;

  if (provider === "openlibrary") {
    data = await lookupOpenLibrary(cleanedIsbn);
  } else if (provider === "googlebooks") {
    data = await lookupGoogleBooks(cleanedIsbn, apiKey);
  }

  if (!data) {
    return {
      success: false,
      error:
        "Libro non trovato. Verifica l'ISBN o inserisci i dati manualmente.",
    };
  }

  // Salva in cache
  await saveToCache(cleanedIsbn, data, provider);

  return {
    success: true,
    data,
    fromCache: false,
  };
}
