/**
 * Debug utilities to track down Recharts NaN errors
 */

export const logChartData = (componentName: string, data: any[], dataKey?: string) => {
  console.group(`🔍 Chart Data Debug: ${componentName}`);
  console.log('Raw data:', data);
  console.log('Data length:', data?.length || 0);
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (item && typeof item === 'object') {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === 'number') {
            if (isNaN(value)) {
              console.error(`❌ NaN found at index ${index}, key "${key}":`, value);
            } else if (!isFinite(value)) {
              console.error(`❌ Infinite value found at index ${index}, key "${key}":`, value);
            }
          }
        });
      }
    });
    
    if (dataKey) {
      const dataKeyValues = data.map(item => item?.[dataKey]).filter(v => typeof v === 'number');
      console.log(`${dataKey} values:`, dataKeyValues);
      const hasNaN = dataKeyValues.some(v => isNaN(v));
      const hasInfinite = dataKeyValues.some(v => !isFinite(v));
      if (hasNaN) console.error(`❌ ${dataKey} contains NaN values`);
      if (hasInfinite) console.error(`❌ ${dataKey} contains infinite values`);
    }
  }
  console.groupEnd();
};

export const safeValidateChartData = (data: any[]): any[] => {
  if (!Array.isArray(data)) {
    console.warn('Chart data is not an array:', data);
    return [];
  }
  
  return data.filter((item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`Filtering out invalid item at index ${index}:`, item);
      return false;
    }
    
    // Check if any numeric values are invalid
    const hasInvalidNumbers = Object.values(item).some(value => 
      typeof value === 'number' && (isNaN(value) || !isFinite(value))
    );
    
    if (hasInvalidNumbers) {
      console.warn(`Filtering out item with invalid numbers at index ${index}:`, item);
      return false;
    }
    
    return true;
  });
};