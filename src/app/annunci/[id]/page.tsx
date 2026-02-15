"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  Check,
  BookOpen,
  Package,
} from "lucide-react";
import {
  ConditionLabels,
  StatusLabels,
  StyleLabels,
  ToneLabels,
} from "@/types";
import type { Condition, Status, Style, Tone } from "@/types";
import {
  generateSeoTitle,
  generateShortDesc,
  generateLongDesc,
  generateTags,
  regenerateMessage,
} from "@/lib/text-generator";
import { formatPrice } from "@/lib/price-calculator";

interface ItemWithListing {
  id: string;
  category: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishYear: number | null;
  language: string | null;
  brand: string | null;
  condition: string;
  defectsJson: string | null;
  defectNotes: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  weight: number | null;
  notes: string | null;
  imagesJson: string | null;
  pricePaid: number | null;
  yearBought: number | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    style: string;
    tone: string;
    seoTitle: string | null;
    shortDesc: string | null;
    longDesc: string | null;
    tagsCsv: string | null;
    messageAvailability: string | null;
    messageDiscount: string | null;
    messageShipping: string | null;
    messageReservation: string | null;
    messageProblem: string | null;
    urgency: number;
    rarity: number;
    comparablesJson: string | null;
    priceQuick: number | null;
    priceMaxProfitMin: number | null;
    priceMaxProfitMax: number | null;
    negotiable: boolean;
    status: string;
    publishedAt: string | null;
    soldAt: string | null;
    soldPrice: number | null;
  } | null;
}

export default function DettaglioAnnuncio() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemWithListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState<Status>("bozza");
  const [seoTitle, setSeoTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [soldPrice, setSoldPrice] = useState<number | undefined>();

  // Messages
  const [messageAvailability, setMessageAvailability] = useState("");
  const [messageDiscount, setMessageDiscount] = useState("");
  const [messageShipping, setMessageShipping] = useState("");
  const [messageReservation, setMessageReservation] = useState("");
  const [messageProblem, setMessageProblem] = useState("");

  useEffect(() => {
    loadItem();
  }, [itemId]);

  async function loadItem() {
    try {
      const res = await fetch(`/api/items/${itemId}`);
      if (!res.ok) throw new Error("Item not found");

      const data = await res.json();
      setItem(data);

      // Populate editable fields
      if (data.listing) {
        setStatus(data.listing.status as Status);
        setSeoTitle(data.listing.seoTitle || "");
        setShortDesc(data.listing.shortDesc || "");
        setLongDesc(data.listing.longDesc || "");
        setTagsCsv(data.listing.tagsCsv || "");
        setSoldPrice(data.listing.soldPrice || undefined);
        setMessageAvailability(data.listing.messageAvailability || "");
        setMessageDiscount(data.listing.messageDiscount || "");
        setMessageShipping(data.listing.messageShipping || "");
        setMessageReservation(data.listing.messageReservation || "");
        setMessageProblem(data.listing.messageProblem || "");
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare l'annuncio",
        variant: "destructive",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!item?.listing) return;

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        status,
        seoTitle,
        shortDesc,
        longDesc,
        tagsCsv,
        messageAvailability,
        messageDiscount,
        messageShipping,
        messageReservation,
        messageProblem,
      };

      if (status === "venduto" && soldPrice) {
        updateData.soldPrice = soldPrice;
        updateData.soldAt = new Date().toISOString();
      }

      if (status === "pubblicato" && !item.listing.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }

      const res = await fetch(`/api/listings/${item.listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Save failed");

      toast({
        title: "Salvato",
        description: "Le modifiche sono state salvate",
      });

      loadItem();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    try {
      const res = await fetch(`/api/items/${itemId}/duplicate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Duplicate failed");

      const newItem = await res.json();
      toast({
        title: "Annuncio duplicato",
        description: "Reindirizzamento alla copia...",
      });
      router.push(`/annunci/${newItem.id}`);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile duplicare l'annuncio",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questo annuncio?")) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast({
        title: "Eliminato",
        description: "L'annuncio è stato eliminato",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'annuncio",
        variant: "destructive",
      });
    }
  }

  function regenerateSeoTitle() {
    if (!item) return;
    const newTitle = generateSeoTitle(
      item.title,
      item.author,
      item.brand,
      item.category as "libro" | "altro",
      item.condition as Condition
    );
    setSeoTitle(newTitle);
  }

  function regenerateShortDescription() {
    if (!item) return;
    const defects = item.defectsJson ? JSON.parse(item.defectsJson) : [];
    const newDesc = generateShortDesc(
      item.title,
      item.category as "libro" | "altro",
      item.condition as Condition,
      (item.listing?.style || "neutro") as Style,
      defects
    );
    setShortDesc(newDesc);
  }

  function regenerateLongDescription() {
    if (!item) return;
    const defects = item.defectsJson ? JSON.parse(item.defectsJson) : [];
    const newDesc = generateLongDesc(
      item.title,
      item.author,
      item.brand,
      item.category as "libro" | "altro",
      item.condition as Condition,
      (item.listing?.style || "neutro") as Style,
      (item.listing?.tone || "standard") as Tone,
      defects,
      item.defectNotes,
      item.color,
      item.size,
      item.material,
      item.notes
    );
    setLongDesc(newDesc);
  }

  function regenerateTagsHandler() {
    if (!item) return;
    const newTags = generateTags(
      item.title,
      item.author,
      item.brand,
      item.category as "libro" | "altro",
      item.condition as Condition,
      item.color,
      item.material
    );
    setTagsCsv(newTags.join(", "));
  }

  function copyAll() {
    const text = `${seoTitle}

${shortDesc}

${longDesc}

Tags: ${tagsCsv}

Prezzo: ${formatPrice(item?.listing?.priceQuick || 0)}`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Copiato!",
      description: "Tutti i testi sono stati copiati",
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "bozza":
        return <Badge variant="secondary">Bozza</Badge>;
      case "pubblicato":
        return <Badge variant="default">Pubblicato</Badge>;
      case "venduto":
        return <Badge variant="success">Venduto</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Annuncio non trovato</p>
        <Button asChild className="mt-4">
          <Link href="/">Torna alla dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{item.title}</h1>
              {getStatusBadge(item.listing?.status || "bozza")}
            </div>
            <p className="text-muted-foreground">
              Creato il{" "}
              {format(new Date(item.createdAt), "d MMMM yyyy", { locale: it })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/export?format=md&itemId=${itemId}`} download>
              <Download className="w-4 h-4 mr-2" />
              Esporta MD
            </a>
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplica
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Testi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Testi Annuncio</CardTitle>
              <Button variant="outline" size="sm" onClick={copyAll}>
                <Copy className="w-4 h-4 mr-2" />
                Copia tutto
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Titolo SEO</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {seoTitle.length}/60
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={regenerateSeoTitle}
                      title="Rigenera"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={60}
                  />
                  <CopyButton text={seoTitle} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Descrizione breve</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {shortDesc.length}/250
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={regenerateShortDescription}
                      title="Rigenera"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    maxLength={250}
                    rows={3}
                  />
                  <CopyButton text={shortDesc} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Descrizione completa</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={regenerateLongDescription}
                    title="Rigenera"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={longDesc}
                    onChange={(e) => setLongDesc(e.target.value)}
                    rows={8}
                  />
                  <CopyButton text={longDesc} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={regenerateTagsHandler}
                    title="Rigenera"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagsCsv}
                    onChange={(e) => setTagsCsv(e.target.value)}
                  />
                  <CopyButton text={tagsCsv} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messaggi */}
          <Card>
            <CardHeader>
              <CardTitle>Template Messaggi</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <div className="flex flex-col gap-1">
                      <CopyButton text={messageAvailability} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMessageAvailability(
                            regenerateMessage(
                              "availability",
                              (item.listing?.tone || "standard") as Tone
                            )
                          )
                        }
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="discount" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageDiscount}
                      onChange={(e) => setMessageDiscount(e.target.value)}
                      rows={3}
                    />
                    <div className="flex flex-col gap-1">
                      <CopyButton text={messageDiscount} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMessageDiscount(
                            regenerateMessage(
                              "discount",
                              (item.listing?.tone || "standard") as Tone
                            )
                          )
                        }
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageShipping}
                      onChange={(e) => setMessageShipping(e.target.value)}
                      rows={3}
                    />
                    <div className="flex flex-col gap-1">
                      <CopyButton text={messageShipping} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMessageShipping(
                            regenerateMessage(
                              "shipping",
                              (item.listing?.tone || "standard") as Tone
                            )
                          )
                        }
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reservation" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageReservation}
                      onChange={(e) => setMessageReservation(e.target.value)}
                      rows={3}
                    />
                    <div className="flex flex-col gap-1">
                      <CopyButton text={messageReservation} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMessageReservation(
                            regenerateMessage(
                              "reservation",
                              (item.listing?.tone || "standard") as Tone
                            )
                          )
                        }
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="problem" className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageProblem}
                      onChange={(e) => setMessageProblem(e.target.value)}
                      rows={3}
                    />
                    <div className="flex flex-col gap-1">
                      <CopyButton text={messageProblem} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMessageProblem(
                            regenerateMessage(
                              "problem",
                              (item.listing?.tone || "standard") as Tone
                            )
                          )
                        }
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dettagli Item */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {item.category === "libro" ? (
                  <BookOpen className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                Dettagli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="capitalize">{item.category}</span>
              </div>
              {item.author && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Autore</span>
                  <span>{item.author}</span>
                </div>
              )}
              {item.brand && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marca</span>
                  <span>{item.brand}</span>
                </div>
              )}
              {item.isbn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISBN</span>
                  <span>{item.isbn}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condizione</span>
                <span>{ConditionLabels[item.condition as Condition]}</span>
              </div>
              {item.color && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colore</span>
                  <span>{item.color}</span>
                </div>
              )}
              {item.size && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taglia</span>
                  <span>{item.size}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prezzi */}
          <Card>
            <CardHeader>
              <CardTitle>Prezzi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.listing?.priceQuick && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Vendita veloce
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(item.listing.priceQuick)}
                    </div>
                  </div>
                  {item.listing.priceMaxProfitMin &&
                    item.listing.priceMaxProfitMax && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Massimo profitto
                        </div>
                        <div className="text-lg font-medium">
                          {formatPrice(item.listing.priceMaxProfitMin)} -{" "}
                          {formatPrice(item.listing.priceMaxProfitMax)}
                        </div>
                      </div>
                    )}
                  {item.listing.negotiable && (
                    <Badge variant="outline">Trattabile</Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Stato */}
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Stato annuncio</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as Status)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bozza">Bozza</SelectItem>
                    <SelectItem value="pubblicato">Pubblicato</SelectItem>
                    <SelectItem value="venduto">Venduto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "venduto" && (
                <div className="grid gap-2">
                  <Label>Prezzo di vendita</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={soldPrice || ""}
                    onChange={(e) =>
                      setSoldPrice(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Es: 15.00"
                  />
                </div>
              )}

              {item.listing?.publishedAt && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Pubblicato: </span>
                  {format(new Date(item.listing.publishedAt), "d MMM yyyy", {
                    locale: it,
                  })}
                </div>
              )}

              {item.listing?.soldAt && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Venduto: </span>
                  {format(new Date(item.listing.soldAt), "d MMM yyyy", {
                    locale: it,
                  })}
                </div>
              )}

              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salva Modifiche
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
