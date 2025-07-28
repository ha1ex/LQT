import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Key, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AIKeySetupProps {
  onKeySet: () => void;
}

export const AIKeySetup: React.FC<AIKeySetupProps> = ({ onKeySet }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setIsValid(true);
      toast({
        title: "API ключ сохранен",
        description: "Теперь вы можете использовать AI рекомендации",
      });
      onKeySet();
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsValid(false);
    toast({
      title: "API ключ удален",
      description: "AI функции отключены",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Настройка AI помощника
        </CardTitle>
        <CardDescription>
          Для использования AI рекомендаций необходим API ключ OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Безопасность:</strong> API ключ сохраняется только в вашем браузере и не передается на сторонние серверы, 
            кроме OpenAI для генерации рекомендаций.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Получите ключ на{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              platform.openai.com
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!apiKey.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить ключ
          </Button>
          {apiKey && (
            <Button variant="outline" onClick={handleClear}>
              Удалить ключ
            </Button>
          )}
        </div>

        {isValid && (
          <Alert>
            <AlertDescription className="text-green-700">
              ✅ API ключ настроен. AI рекомендации доступны!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};