import React from 'react';

/**
 * Safe wrapper for chart data that validates and sanitizes data before passing to Recharts
 */

export interface SafeChartData {
  [key: string]: unknown;
}

interface SafeChartWrapperProps {
  data: SafeChartData[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const isValidNumber = (value: unknown): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const sanitizeDataItem = (item: SafeChartData): SafeChartData | null => {
  if (!item || typeof item !== 'object') return null;
  
  const sanitized: SafeChartData = {};
  let hasValidData = false;
  
  Object.entries(item).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'boolean') {
      // Keep strings and booleans as-is
      sanitized[key] = value;
    } else if (typeof value === 'number') {
      // Validate numbers
      if (isValidNumber(value)) {
        sanitized[key] = value;
        hasValidData = true;
      } else {
        sanitized[key] = 0; // Default invalid numbers to 0
      }
    } else {
      // Keep other types but don't count them as valid data
      sanitized[key] = value;
    }
  });
  
  return hasValidData ? sanitized : null;
};

export const SafeChartWrapper: React.FC<SafeChartWrapperProps> = ({ 
  data, 
  children, 
  fallback = <div className="text-center text-muted-foreground py-8">No valid data to display</div>
}) => {
  const sanitizedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data
      .map(sanitizeDataItem)
      .filter((item): item is SafeChartData => item !== null);
  }, [data]);
  
  if (sanitizedData.length === 0) {
    return <>{fallback}</>;
  }
  
  // Clone children and inject sanitized data
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- injecting data prop into unknown child element
      return React.cloneElement(child, { data: sanitizedData } as any);
    }
    return child;
  });
};

export default SafeChartWrapper;
