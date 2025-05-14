declare module 'chartjs-plugin-crosshair';

// Extend the Chart.js plugin options
import { ChartOptions } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType> {
    crosshair?: {
      line?: {
        color?: string;
        width?: number;
        dashPattern?: number[];
      };
      sync?: {
        enabled?: boolean;
      };
      zoom?: {
        enabled?: boolean;
      };
    };
  }
} 