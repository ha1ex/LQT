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
const sanitizeValue = (value: any): number => {
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

const sanitizeDataArray = (data: any[]): any[] => {
  if (!Array.isArray(data)) {
    if (import.meta.env.DEV) console.warn('Invalid data passed to chart, using empty array');
    return [];
  }

  return data
    .filter(item => item && typeof item === 'object')
    .map((item, index) => {
      const sanitized: any = {};
      
      Object.entries(item).forEach(([key, value]) => {
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
const calculateSafeDomain = (data: any[], dataKey: string): [number, number] => {
  const values = data
    .map(item => sanitizeValue(item[dataKey]))
    .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
  
  if (values.length === 0) return [0, 10];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Ensure we have a valid range
  if (min === max) return [Math.max(0, min - 1), max + 1];
  
  return [Math.max(0, Math.floor(min)), Math.ceil(max)];
};

// Safe wrapper for ResponsiveContainer
export const SafeResponsiveContainer: React.FC<any> = ({ children, ...props }) => {
  return (
    <div className="relative">
      <OriginalResponsiveContainer {...props}>
        {children}
      </OriginalResponsiveContainer>
    </div>
  );
};

// Safe LineChart wrapper
export const SafeLineChart: React.FC<any> = ({ data, children, ...props }) => {
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
export const SafeAreaChart: React.FC<any> = ({ data, children, ...props }) => {
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
export const SafeBarChart: React.FC<any> = ({ data, children, ...props }) => {
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
export const SafePieChart: React.FC<any> = ({ children, ...props }) => {
  return (
    <OriginalPieChart {...props}>
      {children}
    </OriginalPieChart>
  );
};

// Safe Pie wrapper
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