import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-lg">Что-то пошло не так</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Произошла ошибка при загрузке компонента. Попробуйте обновить страницу или повторить действие.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <summary className="cursor-pointer font-medium">Детали ошибки</summary>
              <pre className="mt-2 overflow-auto">{error.message}</pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={resetErrorBoundary} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
            <Button onClick={() => window.location.reload()} size="sm">
              Обновить страницу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback = ErrorFallback,
  onError 
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={onError}
      onReset={() => {
        // Clear any error state if needed
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};