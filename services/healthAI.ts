
import { HealthRecord, HealthSubjectType, DiagnosisResult } from '../types';
import { MOCK_DIAGNOSES } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

// Helper to convert Blob to Base64
const fileToGenerativePart = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const healthAIService = {
  /**
   * Analyzes a photo using Google Gemini Vision.
   */
  async analyzePhoto(blob: Blob, type: HealthSubjectType): Promise<DiagnosisResult> {
    try {
        // Strict adherence: Use process.env.API_KEY directly
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.warn("No API_KEY found. Using mock health data.");
            return this.runMockAnalysis(type);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = await fileToGenerativePart(blob);

        const prompt = `
            Analyze this image of a ${type}. 
            Identify any diseases, pests, nutritional deficiencies, or injuries.
            If the subject looks healthy, explicitly state it is healthy.
            
            Provide a diagnosis with:
            1. The name of the issue.
            2. Probability (0-100).
            3. Severity (low, medium, high, critical).
            4. A short description of visual symptoms.
            5. A list of treatments (focusing on organic/homestead methods).
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
                        issueName: { type: Type.STRING },
                        probability: { type: Type.NUMBER },
                        severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                        description: { type: Type.STRING },
                        treatments: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    organic: { type: Type.BOOLEAN }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as DiagnosisResult;
        }
        
        throw new Error("Empty response from AI");

    } catch (e) {
        console.error("AI Analysis Failed:", e);
        return this.runMockAnalysis(type);
    }
  },

  async runMockAnalysis(type: HealthSubjectType): Promise<DiagnosisResult> {
      return new Promise((resolve) => {
        setTimeout(() => {
            const options = MOCK_DIAGNOSES[type];
            const result = options[Math.floor(Math.random() * options.length)];
            resolve(result);
        }, 2000);
      });
  }
};
