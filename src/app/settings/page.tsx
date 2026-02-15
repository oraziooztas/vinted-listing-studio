"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Shield, Book, Sparkles } from "lucide-react";
import { StyleLabels, ToneLabels } from "@/types";
import type { Style, Tone, IsbnProvider, LlmProvider } from "@/types";

interface Settings {
  hasPin: boolean;
  isbnProvider: IsbnProvider;
  hasIsbnApiKey: boolean;
  defaultStyle: Style;
  defaultTone: Tone;
  llmProvider: LlmProvider;
  hasLlmApiKey: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isbnApiKey, setIsbnApiKey] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    // Validate PIN
    if (newPin && newPin !== confirmPin) {
      toast({
        title: "Errore",
        description: "I PIN non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (newPin && newPin.length < 4) {
      toast({
        title: "Errore",
        description: "Il PIN deve essere di almeno 4 cifre",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        isbnProvider: settings.isbnProvider,
        defaultStyle: settings.defaultStyle,
        defaultTone: settings.defaultTone,
        llmProvider: settings.llmProvider,
      };

      // Include PIN only if changed
      if (newPin) {
        updateData.pin = newPin;
      }

      // Include API keys only if provided
      if (isbnApiKey) {
        updateData.isbnApiKey = isbnApiKey;
      }

      if (llmApiKey) {
        updateData.llmApiKey = llmApiKey;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const data = await res.json();
      setSettings(data);
      setNewPin("");
      setConfirmPin("");
      setIsbnApiKey("");
      setLlmApiKey("");

      toast({
        title: "Salvato",
        description: "Le impostazioni sono state salvate",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemovePin() {
    if (!confirm("Sei sicuro di voler rimuovere il PIN?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "" }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setSettings(data);

      toast({
        title: "PIN rimosso",
        description: "Il PIN di protezione è stato rimosso",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il PIN",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Impossibile caricare le impostazioni
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura le preferenze dell'applicazione
        </p>
      </div>

      {/* Protezione PIN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Protezione App
          </CardTitle>
          <CardDescription>
            Imposta un PIN per proteggere l'accesso all'applicazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.hasPin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                PIN attivo
              </div>
              <div className="grid gap-2">
                <Label>Nuovo PIN (lascia vuoto per non cambiare)</Label>
                <Input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nuovo PIN..."
                  maxLength={8}
                />
              </div>
              {newPin && (
                <div className="grid gap-2">
                  <Label>Conferma nuovo PIN</Label>
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Conferma PIN..."
                    maxLength={8}
                  />
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemovePin}
                disabled={saving}
              >
                Rimuovi PIN
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Nessun PIN impostato
              </div>
              <div className="grid gap-2">
                <Label>Imposta PIN (min. 4 cifre)</Label>
                <Input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN..."
                  maxLength={8}
                />
              </div>
              {newPin && (
                <div className="grid gap-2">
                  <Label>Conferma PIN</Label>
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Conferma..."
                    maxLength={8}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ISBN Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Ricerca ISBN
          </CardTitle>
          <CardDescription>
            Configura il provider per la ricerca automatica dei dati libro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select
              value={settings.isbnProvider}
              onValueChange={(v) =>
                setSettings({ ...settings, isbnProvider: v as IsbnProvider })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openlibrary">
                  Open Library (gratuito)
                </SelectItem>
                <SelectItem value="googlebooks">Google Books</SelectItem>
                <SelectItem value="disabled">Disabilitato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.isbnProvider === "googlebooks" && (
            <div className="grid gap-2">
              <Label>
                Google Books API Key{" "}
                {settings.hasIsbnApiKey && (
                  <span className="text-green-600">(configurata)</span>
                )}
              </Label>
              <Input
                type="password"
                value={isbnApiKey}
                onChange={(e) => setIsbnApiKey(e.target.value)}
                placeholder={
                  settings.hasIsbnApiKey
                    ? "Lascia vuoto per mantenere"
                    : "Inserisci API key..."
                }
              />
              <p className="text-xs text-muted-foreground">
                Opzionale. Aumenta il limite di richieste giornaliere.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Stili */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Stili Predefiniti
          </CardTitle>
          <CardDescription>
            Imposta lo stile e il tono predefiniti per i nuovi annunci
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Stile predefinito</Label>
              <Select
                value={settings.defaultStyle}
                onValueChange={(v) =>
                  setSettings({ ...settings, defaultStyle: v as Style })
                }
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
              <Label>Tono predefinito</Label>
              <Select
                value={settings.defaultTone}
                onValueChange={(v) =>
                  setSettings({ ...settings, defaultTone: v as Tone })
                }
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
        </CardContent>
      </Card>

      {/* LLM Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generazione Testi (Avanzato)
          </CardTitle>
          <CardDescription>
            Configura un provider LLM per generazione testi avanzata (opzionale)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select
              value={settings.llmProvider}
              onValueChange={(v) =>
                setSettings({ ...settings, llmProvider: v as LlmProvider })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template">
                  Template Engine (predefinito)
                </SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="openai">OpenAI GPT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.llmProvider !== "template" && (
            <div className="grid gap-2">
              <Label>
                API Key{" "}
                {settings.hasLlmApiKey && (
                  <span className="text-green-600">(configurata)</span>
                )}
              </Label>
              <Input
                type="password"
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                placeholder={
                  settings.hasLlmApiKey
                    ? "Lascia vuoto per mantenere"
                    : "Inserisci API key..."
                }
              />
              <p className="text-xs text-muted-foreground">
                {settings.llmProvider === "anthropic"
                  ? "Ottieni la tua API key su console.anthropic.com"
                  : "Ottieni la tua API key su platform.openai.com"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Salva Impostazioni
      </Button>
    </div>
  );
}
