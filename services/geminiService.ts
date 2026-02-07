
import { GoogleGenAI, Type } from "@google/genai";
import { MetalData, MarketSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const metalSchema = {
  type: Type.OBJECT,
  properties: {
    currentPrice: { type: Type.NUMBER },
    high24h: { type: Type.NUMBER },
    low24h: { type: Type.NUMBER },
    change24h: { type: Type.NUMBER },
    volatility: { type: Type.STRING, description: "Low, Medium, or High" },
    history: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          price: { type: Type.NUMBER }
        },
        required: ["date", "price"]
      }
    }
  },
  required: ["currentPrice", "high24h", "low24h", "change24h", "volatility", "history"]
};

export const getMetalMarketData = async (): Promise<{ 
  hubs: MetalData[];
  summary: MarketSummary 
}> => {
  const model = "gemini-3-flash-preview";
  
  const dataResponse = await ai.models.generateContent({
    model,
    contents: `Act as a financial data provider. Provide current prices, 24h high/low, % change, volatility, and 5-day historical closing prices for:
    1. USA Hub: Gold Spot (USD/oz), Silver Spot (USD/oz)
    2. China Hub: Shanghai Gold (CNY/g), Shanghai Silver (CNY/g)
    3. UAE Hub: Dubai Gold (AED/g), Dubai Silver (AED/g)
    4. India Hub: MCX Gold (INR/10g), MCX Silver (INR/kg)
    Also provide current FX rates: USD/INR, USD/CNY, USD/AED.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fx: {
            type: Type.OBJECT,
            properties: {
              usdinr: { type: Type.NUMBER },
              usdcny: { type: Type.NUMBER },
              usdaed: { type: Type.NUMBER }
            },
            required: ["usdinr", "usdcny", "usdaed"]
          },
          usa: { 
            type: Type.OBJECT, 
            properties: { gold: metalSchema, silver: metalSchema },
            required: ["gold", "silver"]
          },
          china: { 
            type: Type.OBJECT, 
            properties: { gold: metalSchema, silver: metalSchema },
            required: ["gold", "silver"]
          },
          uae: { 
            type: Type.OBJECT, 
            properties: { gold: metalSchema, silver: metalSchema },
            required: ["gold", "silver"]
          },
          india: { 
            type: Type.OBJECT, 
            properties: { gold: metalSchema, silver: metalSchema },
            required: ["gold", "silver"]
          }
        },
        required: ["fx", "usa", "china", "uae", "india"]
      }
    }
  });

  const raw = JSON.parse(dataResponse.text || '{}');

  const hubData: MetalData[] = [
    { region: 'USA', name: 'USA Gold', symbol: 'XAU', currency: '$', unit: 'oz', ...raw.usa?.gold },
    { region: 'USA', name: 'USA Silver', symbol: 'XAG', currency: '$', unit: 'oz', ...raw.usa?.silver },
    { region: 'China', name: 'CN Gold', symbol: 'SGE', currency: '¥', unit: 'g', ...raw.china?.gold },
    { region: 'China', name: 'CN Silver', symbol: 'SGE', currency: '¥', unit: 'g', ...raw.china?.silver },
    { region: 'UAE', name: 'UAE Gold', symbol: 'DGCX', currency: 'د.إ', unit: 'g', ...raw.uae?.gold },
    { region: 'UAE', name: 'UAE Silver', symbol: 'DGCX', currency: 'د.إ', unit: 'g', ...raw.uae?.silver },
    { region: 'India', name: 'IN Gold', symbol: 'MCX', currency: '₹', unit: '10g', ...raw.india?.gold },
    { region: 'India', name: 'IN Silver', symbol: 'MCX', currency: '₹', unit: 'kg', ...raw.india?.silver },
  ].filter(d => d.currentPrice !== undefined);

  const analysisAndPredictionsResponse = await ai.models.generateContent({
    model,
    contents: "Analyze global bullion markets and provide 7-day price forecasts for Gold and Silver. Include confidence intervals (low/high bounds) and the logical reasoning based on trends. Also discuss price spreads between hubs.",
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          analysis: { type: Type.STRING },
          sentiment: { type: Type.STRING, description: "Strong Bullish, Bullish, Neutral, Bearish, or Strong Bearish" },
          drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metal: { type: Type.STRING },
                predictedPrice: { type: Type.NUMBER },
                lowBound: { type: Type.NUMBER },
                highBound: { type: Type.NUMBER },
                changePercent: { type: Type.NUMBER },
                timeframe: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
              required: ["metal", "predictedPrice", "lowBound", "highBound", "changePercent", "timeframe", "reasoning"]
            }
          }
        },
        required: ["headline", "analysis", "sentiment", "drivers", "predictions"]
      }
    }
  });

  const summaryData = JSON.parse(analysisAndPredictionsResponse.text || '{}');
  const groundingChunks = analysisAndPredictionsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

  return {
    hubs: hubData,
    summary: {
      headline: summaryData.headline || "Global Market Update",
      analysis: summaryData.analysis || "",
      sentiment: (summaryData.sentiment as any) || "Neutral",
      drivers: summaryData.drivers || [],
      sources,
      fx: raw.fx || { usdinr: 83, usdcny: 7.2, usdaed: 3.67 },
      predictions: summaryData.predictions || []
    }
  };
};
