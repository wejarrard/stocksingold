export interface GoldData {
  Date: string;
  Price: number;
}

export interface SpyData {
  Date: string;
  'Closing Value': number;
}

export interface CombinedData {
  date: string;
  spyUSD: number;
  goldPrice: number;
  spyInGold: number;
}

export interface Stats {
  min: number;
  max: number;
  avg: number;
  current: number;
} 