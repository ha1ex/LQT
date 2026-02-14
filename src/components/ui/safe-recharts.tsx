/* eslint-disable react-refresh/only-export-components -- re-exports recharts utilities alongside wrapper components */
/**
 * NUCLEAR SOLUTION: Completely safe Recharts wrappers
 * This replaces ALL Recharts components with bulletproof versions
 */

import React from 'react';
import {
  LineChart as OriginalLineChart,
  AreaChart as OriginalAreaChart,
  BarChart as OriginalBarChart,
  PieChart as OriginalPieChart,
  ResponsiveContainer as OriginalResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

// Ultra-aggressive data sanitization
const sanitizeValue = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  }
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? 0 : value;
  }
  return 0;
};

const sanitizeDataArray = (data: object[]): Record<string, unknown>[] => {
  if (!Array.isArray(data)) {
    if (import.meta.env.DEV) console.warn('Invalid data passed to chart, using empty array');
    return [];
  }

  return data
    .filter(item => item && typeof item === 'object')
    .map((item) => {
      const sanitized: Record<string, unknown> = {};
      
      Object.entries(item).forEach(([key, value]: [string, unknown]) => {
        if (typeof value === 'string' && !['week', 'date', 'name', 'metric'].includes(key)) {
          // Try to parse strings that might be numbers
          const parsed = parseFloat(value);
          sanitized[key] = isNaN(parsed) ? value : sanitizeValue(parsed);
        } else if (typeof value === 'number') {
          sanitized[key] = sanitizeValue(value);
        } else {
          sanitized[key] = value;
        }
      });

      // Extra validation - if this item has no valid numeric data, exclude it
      const hasValidData = Object.values(sanitized).some(val => 
        typeof val === 'number' && !isNaN(val) && isFinite(val)
      );
      
      return hasValidData ? sanitized : null;
    })
    .filter(item => item !== null);
};

// Safe domain calculation
const calculateSafeDomain = (data: object[], dataKey: string): [number, number] => {
  const values = data
    .map(item => sanitizeValue((item as Record<string, unknown>)[dataKey]))
    .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
  
  if (values.length === 0) return [0, 10];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Ensure we have a valid range
  if (min === max) return [Math.max(0, min - 1), max + 1];
  
  return [Math.max(0, Math.floor(min)), Math.ceil(max)];
};

// Safe wrapper for ResponsiveContainer
export const SafeResponsiveContainer: React.FC<React.ComponentProps<typeof OriginalResponsiveContainer>> = ({ children, ...props }) => {
  return (
    <div className="relative">
      <OriginalResponsiveContainer {...props}>
        {children}
      </OriginalResponsiveContainer>
    </div>
  );
};

// Safe LineChart wrapper
export const SafeLineChart: React.FC<React.ComponentProps<typeof OriginalLineChart>> = ({ data, children, ...props }) => {
  const safeData = sanitizeDataArray(data || []);
  
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }


  return (
    <OriginalLineChart data={safeData} {...props}>
      {children}
    </OriginalLineChart>
  );
};

// Safe AreaChart wrapper
export const SafeAreaChart: React.FC<React.ComponentProps<typeof OriginalAreaChart>> = ({ data, children, ...props }) => {
  const safeData = sanitizeDataArray(data || []);
  
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }


  return (
    <OriginalAreaChart data={safeData} {...props}>
      {children}
    </OriginalAreaChart>
  );
};

// Safe BarChart wrapper
export const SafeBarChart: React.FC<React.ComponentProps<typeof OriginalBarChart>> = ({ data, children, ...props }) => {
  const safeData = sanitizeDataArray(data || []);
  
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }


  return (
    <OriginalBarChart data={safeData} {...props}>
      {children}
    </OriginalBarChart>
  );
};

// Safe PieChart wrapper
export const SafePieChart: React.FC<React.ComponentProps<typeof OriginalPieChart>> = ({ children, ...props }) => {
  return (
    <OriginalPieChart {...props}>
      {children}
    </OriginalPieChart>
  );
};

// Safe Pie wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pie component props have complex internal types that don't compose cleanly
export const SafePie: React.FC<any> = ({ data, ...props }) => {
  const safeData = sanitizeDataArray(data || []);

  if (safeData.length === 0) {
    return null;
  }


  return <Pie data={safeData} {...props} />;
};

// Export everything
export {
  SafeResponsiveContainer as ResponsiveContainer,
  SafeLineChart as LineChart,
  SafeAreaChart as AreaChart,
  SafeBarChart as BarChart,
  SafePieChart as PieChart,
  SafePie as Pie,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
};

// Create a safe domain calculator export
export { calculateSafeDomain };