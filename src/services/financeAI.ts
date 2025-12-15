
import { Expense, HerdGroup, GardenBed, ExpenseCategory } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { integrationService } from './integrationService';

// Helper to convert Blob to Base64
const fileToGenerativePart = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const financeAI = {
  /**
   * OCR + Entity Extraction from a receipt image using Gemini Vision.
   */
  async parseReceipt(
    blob: Blob, 
    herds: HerdGroup[], 
    beds: GardenBed[]
  ): Promise<Partial<Expense> & { confidence: number }> {
    
    // Fetch API Key from Admin Settings
    const apiKey = await integrationService.getApiKey('google_gemini');

    if (!apiKey) {
        console.warn("No 'google_gemini' integration found active. Using mock OCR.");
        return this.runMockOCR(herds, beds);
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const base64Data = await fileToGenerativePart(blob);

        // Construct context for the AI to match allocations
        const herdNames = herds.map(h => `${h.name} (ID: ${h.id})`).join(', ');
        const bedNames = beds.map(b => `${b.name} (ID: ${b.id})`).join(', ');

        const prompt = `
            Analyze this receipt image. Extract the total amount, date, and a brief description of items purchased.
            
            Categorize the expense into one of: 'feed', 'seeds', 'equipment', 'infrastructure', 'medical', 'labor', 'utilities', 'other'.
            
            Attempt to allocate this expense to a specific Herd or Garden Bed based on the item names.
            Available Herds: [${herdNames}]
            Available Beds: [${bedNames}]
            
            If items match a specific herd (e.g. "Chicken Feed" for "Main Coop"), set allocationType to 'herd' and allocationId to the ID provided.
            If items match a garden bed (e.g. "Tomato Seeds" for "South Bed"), set allocationType to 'bed' and allocationId.
            Otherwise set allocationType to 'general'.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER },
                        date: { type: Type.STRING, description: "ISO Date String YYYY-MM-DD" },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ['feed', 'seeds', 'equipment', 'infrastructure', 'medical', 'labor', 'utilities', 'other'] },
                        allocationType: { type: Type.STRING, enum: ['general', 'herd', 'bed'] },
                        allocationId: { type: Type.STRING },
                        confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
                    }
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            return {
                amount: result.amount,
                date: result.date ? new Date(result.date).getTime() : Date.now(),
                description: result.description,
                category: result.category as ExpenseCategory,
                allocationType: result.allocationType,
                allocationId: result.allocationId,
                confidence: result.confidence || 0.9
            };
        }
        
        throw new Error("Empty AI Response");

    } catch (e) {
        console.error("Receipt OCR Failed:", e);
        return this.runMockOCR(herds, beds);
    }
  },

  async runMockOCR(herds: HerdGroup[], beds: GardenBed[]): Promise<Partial<Expense> & { confidence: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomScenario = Math.random();
        let result: Partial<Expense> = {};
        
        if (randomScenario > 0.6 && herds.length > 0) {
            result = {
                amount: 45.99,
                date: Date.now(),
                category: 'feed',
                description: 'Layer Pellets (50lb)',
                allocationType: 'herd',
                allocationId: herds[0].id
            };
        } else if (randomScenario > 0.3 && beds.length > 0) {
            result = {
                amount: 12.50,
                date: Date.now(),
                category: 'seeds',
                description: 'Heirloom Tomato Seeds',
                allocationType: 'bed',
                allocationId: beds[0].id
            };
        } else {
            result = {
                amount: 89.00,
                date: Date.now(),
                category: 'equipment',
                description: 'Fencing Supplies',
                allocationType: 'general'
            };
        }
        resolve({ ...result, confidence: 0.85 });
      }, 1500);
    });
  }
};
