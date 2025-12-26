export interface ModelPricing {
  input: number;
  output: number;
  label: string;
}

export interface PricingMap {
  [key: string]: ModelPricing;
}

export interface CalculationStats {
  tracesPerMonth: number;
  modelCost: number;
  embeddingCost: number;
  monthlySearchCost: number;
  computeCost: number;
  infraTotal: number;
  infraRegistry: number;
  infraDb: number;
  infraEgress: number;
  totalMonthly: number;
  costPerUser: number;
  costPer1kTraces: number;
}

export interface SensitivityPoint {
  users: number;
  cost: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}
