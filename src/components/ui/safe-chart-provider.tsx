import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ChartErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ChartErrorFallback: React.FC<ChartErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  console.error('Chart Error Boundary caught error:', error);
  
  return (
    <div className="flex items-center justify-center h-32 border-2 border-dashed border-destructive/20 rounded-lg bg-destructive/5">
      <div className="text-center p-4">
        <h3 className="text-sm font-medium text-destructive mb-2">Chart Error</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {error.message.includes('NaN') ? 'Invalid data detected' : 'Chart rendering failed'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

interface SafeChartProviderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ChartErrorFallbackProps>;
}

export const SafeChartProvider: React.FC<SafeChartProviderProps> = ({ 
  children, 
  fallback = ChartErrorFallback 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        console.error('🚨 Chart Error Boundary:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });
      }}
      onReset={() => {
        console.log('🔄 Chart Error Boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SafeChartProvider;