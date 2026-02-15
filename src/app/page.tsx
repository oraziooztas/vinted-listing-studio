"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  BookOpen,
  Package,
  TrendingUp,
  Clock,
  Download,
  Copy,
  Trash2,
  Edit,
} from "lucide-react";
import type { ItemWithListing, DashboardKpi } from "@/types";
import { ConditionLabels, StatusLabels } from "@/types";
import type { Condition, Status } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [items, setItems] = useState<ItemWithListing[]>([]);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [itemsRes, kpiRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/dashboard"),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpi(kpiData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate(itemId: string) {
    try {
      const res = await fetch(`/api/items/${itemId}/duplicate`, {
        method: "POST",
      });

      if (res.ok) {
        toast({
          title: "Annuncio duplicato",
          description: "L'annuncio è stato duplicato con successo",
        });
        loadData();
      } else {
        throw new Error("Errore duplicazione");
      }
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile duplicare l'annuncio",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Sei sicuro di voler eliminare questo annuncio?")) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Annuncio eliminato",
          description: "L'annuncio è stato eliminato con successo",
        });
        loadData();
      } else {
        throw new Error("Errore eliminazione");
      }
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'annuncio",
        variant: "destructive",
      });
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" ||
      (item.listing?.status || "bozza") === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi annunci Vinted
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/api/export?format=csv" download>
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/annunci/nuovo">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Annuncio
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Totale Annunci
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.draftItems} bozze, {kpi.publishedItems} pubblicati
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venduti</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.soldItems}</div>
              <p className="text-xs text-muted-foreground">
                articoli venduti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prezzo Medio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.avgSalePrice ? `€${kpi.avgSalePrice.toFixed(2)}` : "-"}
              </div>
              <p className="text-xs text-muted-foreground">per vendita</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Medio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.avgDaysToSell ? `${kpi.avgDaysToSell}g` : "-"}
              </div>
              <p className="text-xs text-muted-foreground">per vendita</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, autore o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            <SelectItem value="libro">Libri</SelectItem>
            <SelectItem value="altro">Altro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="pubblicato">Pubblicato</SelectItem>
            <SelectItem value="venduto">Venduto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nessun annuncio</h3>
            <p className="text-muted-foreground mb-4">
              {items.length === 0
                ? "Inizia creando il tuo primo annuncio"
                : "Nessun annuncio corrisponde ai filtri"}
            </p>
            {items.length === 0 && (
              <Button asChild>
                <Link href="/annunci/nuovo">
                  <Plus className="w-4 h-4 mr-2" />
                  Crea Annuncio
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {item.category === "libro" ? (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/annunci/${item.id}`}
                          className="font-medium hover:underline truncate"
                        >
                          {item.listing?.seoTitle || item.title}
                        </Link>
                        {getStatusBadge(item.listing?.status || "bozza")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {item.author && <span>{item.author}</span>}
                        {item.brand && <span>{item.brand}</span>}
                        <span>•</span>
                        <span>
                          {ConditionLabels[item.condition as Condition]}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(item.createdAt), "d MMM yyyy", {
                            locale: it,
                          })}
                        </span>
                      </div>
                      {item.listing?.shortDesc && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                          {item.listing.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.listing?.priceQuick && (
                      <div className="text-right">
                        <div className="font-medium">
                          €{item.listing.priceQuick}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          consigliato
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Modifica"
                      >
                        <Link href={`/annunci/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(item.id)}
                        title="Duplica"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        title="Elimina"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
