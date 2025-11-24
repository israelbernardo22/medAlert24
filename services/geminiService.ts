

import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private apiKey: string | undefined;
  private ai: GoogleGenAI | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.API_KEY;
    if (!this.apiKey) {
      console.warn("Gemini API key not found. AI features will be disabled.");
      return;
    }
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async getMedicationInfo(medicationName: string): Promise<string> {
    if (!this.apiKey || !this.ai) {
      return "AI service is currently unavailable. Please check your API key setup.";
    }

    const prompt = `Provide a brief, easy-to-understand summary for the medication "${medicationName}". Include its primary use, common dosage forms, and 2-3 important side effects. Format it as plain text, not markdown. For example:
    \nPrimary Use: [Description]\nCommon Forms: [Description]\nKey Side Effects: [Side effect 1], [Side effect 2].\n\nThis information is for general knowledge and not a substitute for professional medical advice.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.error("Error fetching medication info from Gemini:", error);
      return "Could not retrieve information for this medication. Please try again later.";
    }
  }
}
   