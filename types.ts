export enum ModelTier {
  FLASH = 'Gemini 1.5 Flash',
  PRO = 'Gemini 1.5 Pro (Nano Banana Pro)',
}

export enum ImageQuality {
  STD = '1K (Standard)',
  HD = '2K (High)',
  UHD = '4K (Ultra)',
}

export interface PricingRates {
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  inputPricePerMillionLong: number; // > 128k context
  outputPricePerMillionLong: number; // > 128k context
  imagePricePerImage: number;
}

export interface FreeTierLimit {
  requestsPerDay: number;
  requestsPerMinute: number;
  description: string;
}

export interface CalculationState {
  inputWords: number;
  outputWords: number;
  imagesPerReq: number;
  imageQuality: ImageQuality;
  requestsPerMonth: number;
  selectedModel: ModelTier;
}

export interface CostResult {
  costPerRequest: number;
  totalCost: number;
  tokenCountInput: number;
  tokenCountOutput: number;
  isLongContext: boolean;
}