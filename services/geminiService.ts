
import { GoogleGenAI } from "@google/genai";
import { FinanceData } from "../types";

export const analyzeFinanceData = async (data: FinanceData): Promise<string> => {
  // 每次呼叫時建立新實例以確保抓取最新選取的 API KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    你是一位專精於「槓桿套利」與「財富自由路徑」的資深私人銀行顧問。
    請深度分析以下財務數據並提供專業建議：
    
    【核心數據】
    - 資產現值(含房產): ${data.realEstate.value + data.assets.reduce((s,a)=>s+a.marketValue, 0)} 萬
    - 總負債(房貸/信貸/質押): ${data.realEstate.mortgageBalance + data.realEstate.creditBalance + data.assets.reduce((s,a)=>s+a.loanPrincipal, 0)} 萬
    - 現金流狀況: 月收 ${data.cashflow.activeIncome + data.cashflow.passiveIncome} 萬 / 月支 ${data.cashflow.housingExpense + data.cashflow.livingExpense + data.cashflow.creditExpense + data.cashflow.insuranceExpense + data.cashflow.flexibleExpense} 萬
    - 壓力測試環境: 股市跌幅 ${data.settings.stressStock}%, 利率調升 ${data.settings.stressInterest}%
    
    【分析要求】
    1. **風險警告**：在高槓桿下，若發生股災或升息，哪一項資產最容易觸發補繳？
    2. **現金流防線**：目前的流動性儲備（${data.liquidity.cash} 萬現金）是否足以應付壓力測試下的利息噴發？
    3. **具體行動**：針對 FIRE 目標（${data.settings.fireTarget} 萬），給出下一階段最關鍵的資產配置建議。
    
    請用繁體中文回答，格式請使用清晰的 Markdown 標題與清單。
  `;

  try {
    const response = await ai.models.generateContent({
      // Upgrade to Pro for complex reasoning tasks as per guidelines
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        systemInstruction: "你是一位嚴謹的金融精算師，請針對高槓桿財務結構給出具備防禦性的投資策略建議。",
        temperature: 0.2,
      },
    });
    
    /**
     * Correctly access the .text property from GenerateContentResponse.
     * Do not call .text() as it is a property.
     */
    return response.text || "AI 分析目前無法生成，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
