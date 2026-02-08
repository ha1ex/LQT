/**
 * Debug utilities to track down Recharts NaN errors
 */

export const logChartData = (componentName: string, data: Array<Record<string, unknown>>, dataKey?: string) => {
  // Только в development режиме
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (import.meta.env.DEV) console.group(`Chart Data Debug: ${componentName}`);
  if (import.meta.env.DEV) console.log('Raw data:', data);
  if (import.meta.env.DEV) console.log('Data length:', data?.length || 0);
  
  if (Array.isArray(data)) {
    let hasIssues = false;
    
    data.forEach((item, index) => {
      if (item && typeof item === 'object') {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === 'number') {
            if (isNaN(value)) {
              if (import.meta.env.DEV) console.log(`⚠️ NaN found at index ${index}, key "${key}":`, value);
              hasIssues = true;
            } else if (!isFinite(value)) {
              if (import.meta.env.DEV) console.log(`⚠️ Infinite value found at index ${index}, key "${key}":`, value);
              hasIssues = true;
            }
          }
        });
      }
    });
    
    if (dataKey) {
      const dataKeyValues = data.map(item => item?.[dataKey]).filter(v => typeof v === 'number');
      if (import.meta.env.DEV) console.log(`${dataKey} values:`, dataKeyValues);
      const hasNaN = dataKeyValues.some(v => isNaN(v));
      const hasInfinite = dataKeyValues.some(v => !isFinite(v));
      if (hasNaN && import.meta.env.DEV) console.log(`${dataKey} contains NaN values`);
      if (hasInfinite && import.meta.env.DEV) console.log(`${dataKey} contains infinite values`);
      hasIssues = hasIssues || hasNaN || hasInfinite;
    }
    
    if (!hasIssues) {
      if (import.meta.env.DEV) console.log('✅ Chart data looks good');
    }
  }
  if (import.meta.env.DEV) console.groupEnd();
};

export const safeValidateChartData = (data: Array<Record<string, unknown>>): Array<Record<string, unknown>> => {
  if (!Array.isArray(data)) {
    if (import.meta.env.DEV) console.log('⚠️ Chart data is not an array:', data);
    return [];
  }
  
  const validData = data.filter((item, index) => {
    if (!item || typeof item !== 'object') {
      if (import.meta.env.DEV) console.log(`⚠️ Filtering out invalid item at index ${index}:`, item);
      return false;
    }
    
    // Check if any numeric values are invalid
    const hasInvalidNumbers = Object.values(item).some(value => 
      typeof value === 'number' && (isNaN(value) || !isFinite(value))
    );
    
    if (hasInvalidNumbers) {
      if (import.meta.env.DEV) console.log(`⚠️ Filtering out item with invalid numbers at index ${index}:`, item);
      return false;
    }
    
    return true;
  });
  
  if (validData.length !== data.length) {
    if (import.meta.env.DEV) console.log(`⚠️ Filtered out ${data.length - validData.length} invalid items`);
  }
  
  return validData;
};