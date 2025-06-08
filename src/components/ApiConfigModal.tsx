import { useState, useEffect } from "react";
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
  const [apiKey, setApiKey] = useState(currentKey);
  const [provider, setProvider] = useState<Provider>(currentProvider);

  // Sincroniza los estados cuando cambian las props
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentKey);
      setProvider(currentProvider);
    }
  }, [isOpen, currentKey, currentProvider]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave(apiKey, provider);
    onClose();
  };

  const handleCancel = () => {
    // Restaurar valores originales al cancelar
    setApiKey(currentKey);
    setProvider(currentProvider);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()} // Previene cerrar al hacer clic fuera
      >
        <DialogHeader>
          <DialogTitle>Configure API Key</DialogTitle>
          <DialogDescription>
            Configure your AI provider API key to enable chat functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider-select">Provider</Label>
            <Select
              value={provider}
              onValueChange={(value: Provider) => setProvider(value)}
            >
              <SelectTrigger id="provider-select">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="openchat">OpenChat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key-input">API Key</Label>
            <Input
              id="api-key-input"
              type="password"
              placeholder={`Paste your ${provider} key here`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
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