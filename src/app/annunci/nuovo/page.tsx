"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  RefreshCw,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import {
  CategoryEnum,
  ConditionEnum,
  StyleEnum,
  ToneEnum,
  CommonDefects,
  ConditionLabels,
  StyleLabels,
  ToneLabels,
} from "@/types";
import type { Category, Condition, Style, Tone, IsbnData } from "@/types";
import {
  generateAllTexts,
  generateAllMessages,
} from "@/lib/text-generator";
import { calculatePrice, formatPrice } from "@/lib/price-calculator";

export default function NuovoAnnuncio() {
  const router = useRouter();
  const { toast } = useToast();

  // Step corrente
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Dati oggetto
  const [category, setCategory] = useState<Category>("libro");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishYear, setPublishYear] = useState<number | undefined>();
  const [language, setLanguage] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState<Condition>("ottimo");
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
  const [defectNotes, setDefectNotes] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState<number | undefined>();
  const [notes, setNotes] = useState("");
  const [pricePaid, setPricePaid] = useState<number | undefined>();
  const [yearBought, setYearBought] = useState<number | undefined>();
  const [isbnLoading, setIsbnLoading] = useState(false);

  // Step 2: Testi e SEO
  const [style, setStyle] = useState<Style>("neutro");
  const [tone, setTone] = useState<Tone>("standard");
  const [seoTitle, setSeoTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Step 3: Prezzo e messaggi
  const [urgency, setUrgency] = useState(3);
  const [rarity, setRarity] = useState(3);
  const [comparables, setComparables] = useState<{ price: number; notes: string }[]>([]);
  const [priceQuick, setPriceQuick] = useState<number | undefined>();
  const [priceMaxMin, setPriceMaxMin] = useState<number | undefined>();
  const [priceMaxMax, setPriceMaxMax] = useState<number | undefined>();
  const [negotiable, setNegotiable] = useState(true);
  const [priceNotes, setPriceNotes] = useState<string[]>([]);

  // Messaggi
  const [messageAvailability, setMessageAvailability] = useState("");
  const [messageDiscount, setMessageDiscount] = useState("");
  const [messageShipping, setMessageShipping] = useState("");
  const [messageReservation, setMessageReservation] = useState("");
  const [messageProblem, setMessageProblem] = useState("");

  // Load default settings
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const settings = await res.json();
        if (settings.defaultStyle) setStyle(settings.defaultStyle);
        if (settings.defaultTone) setTone(settings.defaultTone);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  // ISBN Lookup
  async function handleIsbnLookup() {
    if (!isbn || isbn.length < 10) {
      toast({
        title: "ISBN non valido",
        description: "Inserisci un ISBN di 10 o 13 cifre",
        variant: "destructive",
      });
      return;
    }

    setIsbnLoading(true);
    try {
      const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(isbn)}`);
      const data: IsbnData & { error?: string; fromCache?: boolean } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore nella ricerca");
      }

      // Popola i campi
      if (data.title) setTitle(data.title);
      if (data.author) setAuthor(data.author);
      if (data.publisher) setPublisher(data.publisher);
      if (data.publishYear) setPublishYear(data.publishYear);
      if (data.language) setLanguage(data.language);

      toast({
        title: "Dati trovati",
        description: data.fromCache
          ? "Dati recuperati dalla cache"
          : "Dati recuperati con successo",
      });
    } catch (error) {
      toast({
        title: "Libro non trovato",
        description:
          error instanceof Error
            ? error.message
            : "Verifica l'ISBN o inserisci i dati manualmente",
        variant: "destructive",
      });
    } finally {
      setIsbnLoading(false);
    }
  }

  // Genera testi
  function handleGenerateTexts() {
    const texts = generateAllTexts(
      title,
      author || null,
      brand || null,
      category,
      condition,
      style,
      tone,
      selectedDefects,
      defectNotes || null,
      color || null,
      size || null,
      material || null,
      notes || null
    );

    setSeoTitle(texts.seoTitle);
    setShortDesc(texts.shortDesc);
    setLongDesc(texts.longDesc);
    setTags(texts.tags);

    toast({
      title: "Testi generati",
      description: "I testi sono stati generati con successo",
    });
  }

  // Genera messaggi
  function handleGenerateMessages() {
    const messages = generateAllMessages(tone);
    setMessageAvailability(messages.availability);
    setMessageDiscount(messages.discount);
    setMessageShipping(messages.shipping);
    setMessageReservation(messages.reservation);
    setMessageProblem(messages.problem);
  }

  // Calcola prezzi
  function handleCalculatePrice() {
    const result = calculatePrice({
      condition,
      pricePaid: pricePaid || null,
      yearBought: yearBought || null,
      urgency,
      rarity,
      comparables: comparables.filter((c) => c.price > 0).map((c) => ({
        price: c.price,
        notes: c.notes || undefined,
      })),
      category,
    });

    setPriceQuick(result.quickSalePrice);
    setPriceMaxMin(result.maxProfitMin);
    setPriceMaxMax(result.maxProfitMax);
    setNegotiable(result.negotiable);
    setPriceNotes(result.notes);
  }

  // Navigazione step
  function nextStep() {
    if (step === 1) {
      if (!title) {
        toast({
          title: "Titolo obbligatorio",
          description: "Inserisci un titolo per l'annuncio",
          variant: "destructive",
        });
        return;
      }
      handleGenerateTexts();
    }
    if (step === 2) {
      handleCalculatePrice();
      handleGenerateMessages();
    }
    setStep(Math.min(step + 1, 3));
  }

  function prevStep() {
    setStep(Math.max(step - 1, 1));
  }

  // Salva annuncio
  async function handleSave(status: "bozza" | "pubblicato" = "bozza") {
    setSaving(true);

    try {
      // 1. Crea item
      const itemRes = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          author: author || null,
          isbn: isbn || null,
          publisher: publisher || null,
          publishYear: publishYear || null,
          language: language || null,
          brand: brand || null,
          condition,
          defectsJson: selectedDefects.length > 0 ? JSON.stringify(selectedDefects) : null,
          defectNotes: defectNotes || null,
          color: color || null,
          size: size || null,
          material: material || null,
          weight: weight || null,
          notes: notes || null,
          pricePaid: pricePaid || null,
          yearBought: yearBought || null,
        }),
      });

      if (!itemRes.ok) {
        const error = await itemRes.json();
        throw new Error(error.error || "Errore nella creazione");
      }

      const item = await itemRes.json();

      // 2. Crea listing
      const listingRes = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          style,
          tone,
          seoTitle,
          shortDesc,
          longDesc,
          tagsCsv: tags.join(", "),
          messageAvailability,
          messageDiscount,
          messageShipping,
          messageReservation,
          messageProblem,
          urgency,
          rarity,
          comparablesJson: comparables.length > 0 ? JSON.stringify(comparables) : null,
          priceQuick,
          priceMaxProfitMin: priceMaxMin,
          priceMaxProfitMax: priceMaxMax,
          negotiable,
          status,
          publishedAt: status === "pubblicato" ? new Date().toISOString() : null,
        }),
      });

      if (!listingRes.ok) {
        const error = await listingRes.json();
        throw new Error(error.error || "Errore nel salvataggio listing");
      }

      toast({
        title: "Annuncio salvato",
        description:
          status === "pubblicato"
            ? "L'annuncio è stato salvato e marcato come pubblicato"
            : "L'annuncio è stato salvato come bozza",
      });

      router.push(`/annunci/${item.id}`);
    } catch (error) {
      toast({
        title: "Errore",
        description:
          error instanceof Error
            ? error.message
            : "Impossibile salvare l'annuncio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // Copia tutto
  function copyAll() {
    const text = `${seoTitle}

${shortDesc}

${longDesc}

Tags: ${tags.join(", ")}

Prezzo consigliato: ${formatPrice(priceQuick || 0)}`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Copiato!",
      description: "Tutti i testi sono stati copiati negli appunti",
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuovo Annuncio</h1>
          <p className="text-muted-foreground">
            Step {step} di 3:{" "}
            {step === 1
              ? "Dati oggetto"
              : step === 2
              ? "Testi e SEO"
              : "Prezzo e messaggi"}
          </p>
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={nextStep}>
              Avanti
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave("bozza")}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salva Bozza
              </Button>
              <Button onClick={() => handleSave("pubblicato")} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salva e Pubblica
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Dati oggetto */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Dati oggetto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categoria */}
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libro">Libro</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ISBN (solo per libri) */}
            {category === "libro" && (
              <div className="grid gap-2">
                <Label>ISBN (opzionale)</Label>
                <div className="flex gap-2">
                  <Input
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978..."
                  />
                  <Button
                    variant="outline"
                    onClick={handleIsbnLookup}
                    disabled={isbnLoading}
                  >
                    {isbnLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="ml-2">Cerca</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Titolo */}
            <div className="grid gap-2">
              <Label>Titolo *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === "libro"
                    ? "Es: Il nome della rosa"
                    : "Es: Giacca in pelle vintage"
                }
              />
            </div>

            {/* Autore (solo per libri) */}
            {category === "libro" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Autore</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Es: Umberto Eco"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Editore</Label>
                  <Input
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Es: Bompiani"
                  />
                </div>
              </div>
            )}

            {category === "libro" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Anno pubblicazione</Label>
                  <Input
                    type="number"
                    value={publishYear || ""}
                    onChange={(e) =>
                      setPublishYear(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="Es: 1980"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Lingua</Label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Es: Italiano"
                  />
                </div>
              </div>
            )}

            {/* Marca (solo per altro) */}
            {category === "altro" && (
              <div className="grid gap-2">
                <Label>Marca</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Es: Zara, Nike..."
                />
              </div>
            )}

            {/* Condizione */}
            <div className="grid gap-2">
              <Label>Condizione *</Label>
              <Select
                value={condition}
                onValueChange={(v) => setCondition(v as Condition)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ConditionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difetti */}
            <div className="grid gap-2">
              <Label>Difetti</Label>
              <div className="flex flex-wrap gap-2">
                {CommonDefects.map((defect) => (
                  <label
                    key={defect}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedDefects.includes(defect)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDefects([...selectedDefects, defect]);
                        } else {
                          setSelectedDefects(
                            selectedDefects.filter((d) => d !== defect)
                          );
                        }
                      }}
                    />
                    {defect}
                  </label>
                ))}
              </div>
              <Textarea
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                placeholder="Note aggiuntive sui difetti..."
                className="mt-2"
              />
            </div>

            {/* Dettagli aggiuntivi */}
            {category === "altro" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Colore</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Es: Nero"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Taglia</Label>
                  <Input
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Es: M, 42..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Materiale</Label>
                  <Input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Es: Cotone"
                  />
                </div>
              </div>
            )}

            {/* Prezzo e anno acquisto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prezzo pagato (opzionale)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricePaid || ""}
                  onChange={(e) =>
                    setPricePaid(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Es: 25.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Anno acquisto (opzionale)</Label>
                <Input
                  type="number"
                  value={yearBought || ""}
                  onChange={(e) =>
                    setYearBought(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Es: 2020"
                />
              </div>
            </div>

            {/* Note */}
            <div className="grid gap-2">
              <Label>Note aggiuntive</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informazioni extra che vuoi includere..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Testi e SEO */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stile e Tono</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Stile annuncio</Label>
                  <Select
                    value={style}
                    onValueChange={(v) => setStyle(v as Style)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(StyleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tono</Label>
                  <Select
                    value={tone}
                    onValueChange={(v) => setTone(v as Tone)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ToneLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerateTexts} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Rigenera testi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Testi Generati</CardTitle>
              <Button variant="outline" onClick={copyAll}>
                <Copy className="w-4 h-4 mr-2" />
                Copia tutto
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Titolo SEO */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Titolo SEO</Label>
                  <span className="text-xs text-muted-foreground">
                    {seoTitle.length}/60
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={60}
                  />
                  <CopyButton text={seoTitle} label="Copia" />
                </div>
              </div>

              {/* Descrizione breve */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Descrizione breve</Label>
                  <span className="text-xs text-muted-foreground">
                    {shortDesc.length}/250
                  </span>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    maxLength={250}
                    rows={3}
                  />
                  <CopyButton text={shortDesc} label="Copia" />
                </div>
              </div>

              {/* Descrizione lunga */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Descrizione completa</Label>
                  <span className="text-xs text-muted-foreground">
                    {longDesc.length} caratteri
                  </span>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={longDesc}
                    onChange={(e) => setLongDesc(e.target.value)}
                    rows={8}
                  />
                  <CopyButton text={longDesc} label="Copia" />
                </div>
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Tags / Keywords</Label>
                  <span className="text-xs text-muted-foreground">
                    {tags.length}/12
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tags.join(", ")}
                    onChange={(e) =>
                      setTags(e.target.value.split(",").map((t) => t.trim()))
                    }
                    placeholder="tag1, tag2, tag3..."
                  />
                  <CopyButton text={tags.join(", ")} label="Copia" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Prezzo e messaggi */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calcolo Prezzo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>
                      Urgenza vendita: {urgency}/5
                      <span className="text-xs text-muted-foreground ml-2">
                        (1 = molto urgente, 5 = nessuna fretta)
                      </span>
                    </Label>
                    <Slider
                      value={[urgency]}
                      onValueChange={([v]) => setUrgency(v)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Rarità percepita: {rarity}/5
                      <span className="text-xs text-muted-foreground ml-2">
                        (1 = molto comune, 5 = molto raro)
                      </span>
                    </Label>
                    <Slider
                      value={[rarity]}
                      onValueChange={([v]) => setRarity(v)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Prezzi comparabili (opzionale)</Label>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Prezzo ${i + 1}`}
                        value={comparables[i]?.price || ""}
                        onChange={(e) => {
                          const newComps = [...comparables];
                          newComps[i] = {
                            price: parseFloat(e.target.value) || 0,
                            notes: newComps[i]?.notes || "",
                          };
                          setComparables(newComps.filter((c) => c.price > 0));
                        }}
                      />
                      <Input
                        placeholder="Note"
                        value={comparables[i]?.notes || ""}
                        onChange={(e) => {
                          const newComps = [...comparables];
                          newComps[i] = {
                            price: newComps[i]?.price || 0,
                            notes: e.target.value,
                          };
                          setComparables(newComps);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculatePrice} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricalcola prezzi
              </Button>

              {priceQuick && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Vendita veloce
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(priceQuick)}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Massimo profitto
                      </div>
                      <div className="text-2xl font-bold">
                        {formatPrice(priceMaxMin || 0)} -{" "}
                        {formatPrice(priceMaxMax || 0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={negotiable}
                        onCheckedChange={(c) => setNegotiable(c as boolean)}
                      />
                      <Label>Prezzo trattabile</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Note sul prezzo</Label>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {priceNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Messaggi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateMessages} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Rigenera messaggi
              </Button>

              <Tabs defaultValue="availability">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="availability">Disponibilità</TabsTrigger>
                  <TabsTrigger value="discount">Sconto</TabsTrigger>
                  <TabsTrigger value="shipping">Spedizione</TabsTrigger>
                  <TabsTrigger value="reservation">Prenotazione</TabsTrigger>
                  <TabsTrigger value="problem">Problema</TabsTrigger>
                </TabsList>

                <TabsContent value="availability" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageAvailability}
                      onChange={(e) => setMessageAvailability(e.target.value)}
                      rows={3}
                    />
                    <CopyButton text={messageAvailability} label="Copia" />
                  </div>
                </TabsContent>

                <TabsContent value="discount" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageDiscount}
                      onChange={(e) => setMessageDiscount(e.target.value)}
                      rows={3}
                    />
                    <CopyButton text={messageDiscount} label="Copia" />
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageShipping}
                      onChange={(e) => setMessageShipping(e.target.value)}
                      rows={3}
                    />
                    <CopyButton text={messageShipping} label="Copia" />
                  </div>
                </TabsContent>

                <TabsContent value="reservation" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageReservation}
                      onChange={(e) => setMessageReservation(e.target.value)}
                      rows={3}
                    />
                    <CopyButton text={messageReservation} label="Copia" />
                  </div>
                </TabsContent>

                <TabsContent value="problem" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageProblem}
                      onChange={(e) => setMessageProblem(e.target.value)}
                      rows={3}
                    />
                    <CopyButton text={messageProblem} label="Copia" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
