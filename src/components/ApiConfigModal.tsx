import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Provider =
  | "openai"
  | "gemini"
  | "mistral"
  | "ollama"
  | "openrouter"
  | "openchat";

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, provider: Provider) => void;
  currentKey: string;
  currentProvider: Provider;
}

const ApiConfigModal = ({
  isOpen,
  onClose,
  onSave,
  currentKey,
  currentProvider,
}: ApiConfigModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [isClosing, setIsClosing] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar valores cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentKey);
      setProvider(currentProvider);
      setIsClosing(false);
    }
  }, [isOpen, currentKey, currentProvider]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave(apiKey, provider);
    safeClose();
  };

  const handleCancel = () => {
    safeClose();
  };

  // Solución crítica: cerrar de forma segura con retraso controlado
  const safeClose = () => {
    setIsClosing(true);

    // Limpiar cualquier timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cerrar después de un pequeño retraso para permitir animaciones
    timeoutRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Evitar renderizar contenido de Select si el modal está cerrando
  const shouldRenderSelectContent = isOpen && !isClosing;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        ref={selectRef}
      >
        <DialogHeader>
          <DialogTitle>Configure API Key</DialogTitle>
          <DialogDescription>
            Configure your AI provider API key to enable chat functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(value: Provider) => setProvider(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              {/* SOLUCIÓN CRÍTICA: Renderizado condicional */}
              {shouldRenderSelectContent && (
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="openchat">OpenChat</SelectItem>
                </SelectContent>
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder={`Paste your ${provider} key here`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              🔒 Your key is stored locally and not sent to our servers
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiConfigModal;
