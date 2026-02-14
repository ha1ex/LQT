import * as Sentry from '@sentry/react';

export const SentryErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Sentry.ErrorBoundary
    fallback={
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }
  >
    {children}
  </Sentry.ErrorBoundary>
);
