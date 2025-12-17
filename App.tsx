import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Calculator, Coins, BarChart3, Image as ImageIcon, 
  Type, Zap, Info, MessageSquare, FileText, PenTool, Check, AlertTriangle, Crown 
} from 'lucide-react';
import { ModelTier, CalculationState, CostResult, ImageQuality } from './types';
import { PRICING, WORDS_TO_TOKENS_MULTIPLIER, DEFAULT_STATE, PRESETS, FREE_LIMITS, SUBSCRIPTION_PRICE } from './constants';
import { InfoTooltip } from './components/InfoTooltip';
import { CostChart } from './components/CostChart';

const App: React.FC = () => {
  const [state, setState] = useState<CalculationState>(DEFAULT_STATE);

  // Helper to calculate cost for a specific tier based on current inputs
  const calculateTierCost = (tier: ModelTier, inputs: Omit<CalculationState, 'selectedModel'>): CostResult => {
    const rates = PRICING[tier];
    const inputTokens = Math.ceil(inputs.inputWords * WORDS_TO_TOKENS_MULTIPLIER);
    const outputTokens = Math.ceil(inputs.outputWords * WORDS_TO_TOKENS_MULTIPLIER);
    
    // Check for Long Context (standard threshold is 128k tokens)
    const isLongContext = inputTokens > 128000;

    const currentInputRate = isLongContext ? rates.inputPricePerMillionLong : rates.inputPricePerMillion;
    const currentOutputRate = isLongContext ? rates.outputPricePerMillionLong : rates.outputPricePerMillion;

    const inputCost = (inputTokens / 1_000_000) * currentInputRate;
    const outputCost = (outputTokens / 1_000_000) * currentOutputRate;
    
    const imageCost = inputs.imagesPerReq * rates.imagePricePerImage;

    const costPerRequest = inputCost + outputCost + imageCost;
    const totalCost = costPerRequest * inputs.requestsPerMonth;

    return {
      costPerRequest,
      totalCost,
      tokenCountInput: inputTokens,
      tokenCountOutput: outputTokens,
      isLongContext
    };
  };

  // Main calculation for selected model
  const result = useMemo(() => {
    return calculateTierCost(state.selectedModel, state);
  }, [state]);

  // Comparison calculation
  const flashResult = useMemo(() => calculateTierCost(ModelTier.FLASH, state), [state]);
  const proResult = useMemo(() => calculateTierCost(ModelTier.PRO, state), [state]);

  // Free Tier Analysis
  const analyzeFreeTier = (tier: ModelTier, requestsPerMonth: number, imagesPerReq: number) => {
    const limits = FREE_LIMITS[tier];
    // Approximation: Monthly limit = Daily Limit * 30
    const monthlyLimit = limits.requestsPerDay * 30;
    
    const isRpdLimitOk = requestsPerMonth <= monthlyLimit;
    const isImageLimitOk = imagesPerReq === 0;

    const isWithinLimit = isRpdLimitOk && isImageLimitOk;
    
    // Percentage reflects the RPD usage for the bar (we can cap at 100%)
    const percentage = Math.min(100, (requestsPerMonth / monthlyLimit) * 100);
    
    return { monthlyLimit, percentage, isWithinLimit, isRpdLimitOk, isImageLimitOk, limits };
  };

  const freeTierStatus = useMemo(() => {
    return analyzeFreeTier(state.selectedModel, state.requestsPerMonth, state.imagesPerReq);
  }, [state.selectedModel, state.requestsPerMonth, state.imagesPerReq]);
  
  // Subscription Analysis
  const requestsForBudget = useMemo(() => {
     return Math.floor(SUBSCRIPTION_PRICE / result.costPerRequest);
  }, [result.costPerRequest]);
  
  const isApiCheaper = result.totalCost < SUBSCRIPTION_PRICE;


  const handleInputChange = (field: keyof CalculationState, value: number | string) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare size={20} className="text-blue-600" />;
      case 'FileText': return <FileText size={20} className="text-orange-600" />;
      case 'PenTool': return <PenTool size={20} className="text-purple-600" />;
      default: return <Zap size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">API Calculator</h1>
              <p className="text-xs text-gray-500">Nano Banana PRO / Gemini Estimation</p>
            </div>
          </div>
          <a 
            href="https://ai.google.dev/gemini-api/docs/pricing" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Тарифы Google <Settings size={14} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Presets Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Zap size={20} className="text-blue-500" />
            Популярные сценарии
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setState(preset.state)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                   <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                     {getPresetIcon(preset.icon)}
                   </div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">Пример</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{preset.name}</h3>
                <p className="text-sm text-gray-500 leading-snug">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Model Selection Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Coins size={20} className="text-yellow-500" />
                Выберите модель
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputChange('selectedModel', ModelTier.PRO)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    state.selectedModel === ModelTier.PRO
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-900">Nano Banana PRO</div>
                  <div className="text-sm text-gray-500">Мощная, мультимодальная (Gemini 1.5 Pro)</div>
                </button>
                <button
                  onClick={() => handleInputChange('selectedModel', ModelTier.FLASH)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    state.selectedModel === ModelTier.FLASH
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-900">Gemini Flash</div>
                  <div className="text-sm text-gray-500">Быстрая, экономичная</div>
                </button>
              </div>
            </div>

            {/* Parameters Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-gray-500" />
                Параметры запроса
              </h2>

              {/* Input Words */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Входящий текст <span className="text-blue-600 ml-1">(на 1 запрос)</span>
                    <InfoTooltip text="Количество слов, отправляемых в модель за один раз. Это значение умножается на количество запросов в месяц." />
                  </label>
                  <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                    {state.inputWords.toLocaleString()} слов
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={state.inputWords}
                  onChange={(e) => handleInputChange('inputWords', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>10,000+</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={state.inputWords}
                    onChange={(e) => handleInputChange('inputWords', Math.max(0, parseInt(e.target.value) || 0))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                  />
                  <span className="text-xs text-gray-500">≈ {Math.ceil(state.inputWords * WORDS_TO_TOKENS_MULTIPLIER).toLocaleString()} токенов</span>
                </div>
              </div>

              {/* Output Words */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Исходящий текст <span className="text-blue-600 ml-1">(на 1 запрос)</span>
                    <InfoTooltip text="Количество слов в ответе модели за один раз." />
                  </label>
                  <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                    {state.outputWords.toLocaleString()} слов
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="50"
                  value={state.outputWords}
                  onChange={(e) => handleInputChange('outputWords', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="mt-2 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={state.outputWords}
                    onChange={(e) => handleInputChange('outputWords', Math.max(0, parseInt(e.target.value) || 0))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                  />
                  <span className="text-xs text-gray-500">≈ {Math.ceil(state.outputWords * WORDS_TO_TOKENS_MULTIPLIER).toLocaleString()} токенов</span>
                </div>
              </div>

              {/* Images & Quality */}
              <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ImageIcon size={16} className="text-purple-600"/>
                    Изображения (на 1 запрос)
                  </label>
                  <span className="text-sm font-bold bg-white text-purple-700 px-2 py-1 rounded shadow-sm border border-purple-100">
                    {state.imagesPerReq} шт.
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={state.imagesPerReq}
                  onChange={(e) => handleInputChange('imagesPerReq', parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-4"
                />

                {/* Quality Selector */}
                {state.imagesPerReq > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 items-center border-t border-purple-200 pt-3 animate-fade-in">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Качество:</span>
                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-purple-100 w-full sm:w-auto">
                      {Object.values(ImageQuality).map((q) => (
                        <button
                          key={q}
                          onClick={() => handleInputChange('imageQuality', q)}
                          className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded transition-all ${
                            state.imageQuality === q
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-purple-50'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="ml-auto">
                       <InfoTooltip text="Стоимость генерации изображений пока унифицирована для всех разрешений в API ($0.04), но выбор качества поможет уточнить требования." />
                    </div>
                  </div>
                )}
              </div>

               {/* Frequency */}
               <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Частота <span className="text-green-600 ml-1">(запросов в месяц)</span>
                    <InfoTooltip text="Общее количество вызовов API за расчетный период." />
                  </label>
                  <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                    {state.requestsPerMonth.toLocaleString()}
                  </span>
                </div>
                 <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={state.requestsPerMonth}
                  onChange={(e) => handleInputChange('requestsPerMonth', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="mt-2">
                  <input 
                    type="number" 
                    value={state.requestsPerMonth}
                    onChange={(e) => handleInputChange('requestsPerMonth', Math.max(0, parseInt(e.target.value) || 0))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Total Cost Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 sticky top-24">
              <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Итоговая смета</h2>
              
              <div className="mb-6">
                <div className="text-4xl font-extrabold text-blue-600">
                  ${result.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">в месяц (Pay-as-you-go)</div>
              </div>

              {/* Free Tier Eligibility Block */}
              <div className={`mb-6 p-4 rounded-lg border ${freeTierStatus.isWithinLimit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex justify-between items-start mb-2">
                   <h3 className={`text-sm font-bold flex items-center gap-1.5 ${freeTierStatus.isWithinLimit ? 'text-green-800' : 'text-red-800'}`}>
                     {freeTierStatus.isWithinLimit ? <Check size={16}/> : <AlertTriangle size={16}/>}
                     Free Tier
                   </h3>
                   <span className="text-xs font-mono bg-white px-2 py-1 rounded shadow-sm opacity-80">
                      {Math.floor(state.requestsPerMonth / 30)} / {freeTierStatus.limits.requestsPerDay} RPD
                   </span>
                </div>
                
                <div className="w-full bg-white rounded-full h-2 mb-2 overflow-hidden border border-opacity-20 border-gray-400">
                  <div 
                    className={`h-full rounded-full ${freeTierStatus.isWithinLimit ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${Math.min(100, freeTierStatus.percentage)}%` }}
                  ></div>
                </div>

                <p className={`text-xs ${freeTierStatus.isWithinLimit ? 'text-green-700' : 'text-red-700'} leading-tight`}>
                  {freeTierStatus.isWithinLimit 
                    ? `Вы укладываетесь в бесплатные лимиты (${freeTierStatus.limits.description}). Стоимость может быть $0.00.` 
                    : !freeTierStatus.isRpdLimitOk 
                        ? `Превышен лимит запросов для бесплатного тарифа (${Math.floor(state.requestsPerMonth/30)} > ${freeTierStatus.limits.requestsPerDay} RPD).`
                        : `Генерация изображений является платной функцией ($0.04/шт) и не входит в Free Tier.`
                  }
                </p>
              </div>
              
              {/* Subscription Comparison */}
              <div className="mb-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Crown size={14} className="text-yellow-500" />
                    AI Premium
                  </h3>
                  <span className="text-sm font-bold text-gray-900">${SUBSCRIPTION_PRICE}/мес</span>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                   <div className="flex justify-between text-sm mb-1">
                     <span className="text-gray-600">Бюджет $20 в API:</span>
                     <span className="font-bold text-gray-900">{requestsForBudget.toLocaleString()} запросов</span>
                   </div>
                   <div className="w-full bg-white h-2 rounded-full overflow-hidden mb-2">
                     <div className={`h-full ${!isApiCheaper ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{width: `${Math.min(100, (state.requestsPerMonth / requestsForBudget) * 100)}%`}}
                     />
                   </div>
                   <p className="text-xs text-gray-500 leading-snug">
                     {isApiCheaper
                       ? `API выгоднее! Экономия $${(SUBSCRIPTION_PRICE - result.totalCost).toFixed(2)} по сравнению с подпиской.`
                       : `При таком объеме подписка (Web UI) дешевле на $${(result.totalCost - SUBSCRIPTION_PRICE).toFixed(2)}, если вам подходит ручной режим.`
                     }
                   </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                 <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Цена за 1 запрос:</span>
                  <span className="font-semibold">${result.costPerRequest.toFixed(5)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Токенов (вход):</span>
                  <span className="font-mono">{result.tokenCountInput.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Токенов (выход):</span>
                  <span className="font-mono">{result.tokenCountOutput.toLocaleString()}</span>
                </div>
                 {result.isLongContext && (
                  <div className="bg-orange-50 text-orange-700 text-xs p-2 rounded flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>Включен тариф Long Context (>128k токенов), цена за вход/выход удвоена.</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                 <CostChart flashCost={flashResult.totalCost} proCost={proResult.totalCost} />
              </div>

              <div className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                * Расчет является приблизительным. Фактическая стоимость может отличаться из-за методов подсчета токенов Google, кэширования контекста и округления. Тарифы основаны на модели Pay-as-you-go.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;