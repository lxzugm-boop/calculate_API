import { ModelTier, PricingRates, CalculationState, ImageQuality, FreeTierLimit } from './types';

// Approximate conversion: 1 word ≈ 1.33 tokens, or 1000 tokens ≈ 750 words.
// We will use 1.33 for safety margin in estimation.
export const WORDS_TO_TOKENS_MULTIPLIER = 1.33;

export const SUBSCRIPTION_PRICE = 19.99;

export const PRICING: Record<ModelTier, PricingRates> = {
  [ModelTier.FLASH]: {
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    inputPricePerMillionLong: 0.15,
    outputPricePerMillionLong: 0.60,
    imagePricePerImage: 0.04, // Estimate for flash-level generation
  },
  [ModelTier.PRO]: {
    inputPricePerMillion: 3.50,
    outputPricePerMillion: 10.50,
    inputPricePerMillionLong: 7.00,
    outputPricePerMillionLong: 21.00,
    imagePricePerImage: 0.04, // Using standard rate for simplicity
  },
};

export const FREE_LIMITS: Record<ModelTier, FreeTierLimit> = {
  [ModelTier.FLASH]: {
    requestsPerDay: 1500,
    requestsPerMinute: 15,
    description: "1,500 запросов/день"
  },
  [ModelTier.PRO]: {
    requestsPerDay: 50,
    requestsPerMinute: 2,
    description: "50 запросов/день"
  }
};

export const DEFAULT_STATE: CalculationState = {
  inputWords: 500,
  outputWords: 200,
  imagesPerReq: 0,
  imageQuality: ImageQuality.STD,
  requestsPerMonth: 1000,
  selectedModel: ModelTier.PRO,
};

export interface Preset {
  name: string;
  description: string;
  icon: string;
  state: CalculationState;
}

export const PRESETS: Preset[] = [
  {
    name: "Чат-бот поддержки",
    description: "Много коротких диалогов. Gemini Flash.",
    icon: "MessageSquare",
    state: {
      inputWords: 100,
      outputWords: 150,
      imagesPerReq: 0,
      imageQuality: ImageQuality.STD,
      requestsPerMonth: 20000,
      selectedModel: ModelTier.FLASH,
    },
  },
  {
    name: "Анализ документов",
    description: "Разбор больших отчетов. Gemini Pro.",
    icon: "FileText",
    state: {
      inputWords: 8000,
      outputWords: 500,
      imagesPerReq: 0,
      imageQuality: ImageQuality.STD,
      requestsPerMonth: 200,
      selectedModel: ModelTier.PRO,
    },
  },
  {
    name: "SMM и Маркетинг",
    description: "Посты с картинками. Gemini Pro.",
    icon: "PenTool",
    state: {
      inputWords: 300,
      outputWords: 600,
      imagesPerReq: 1,
      imageQuality: ImageQuality.HD,
      requestsPerMonth: 500,
      selectedModel: ModelTier.PRO,
    },
  },
];