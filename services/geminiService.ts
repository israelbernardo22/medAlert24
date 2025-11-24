
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A check to ensure the API key is available.
  // In a real app, this would be handled more gracefully.
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getMedicationInfo = async (medicationName: string): Promise<string> => {
  if (!API_KEY) {
    return "AI service is currently unavailable. Please check your API key setup.";
  }

  const prompt = `Provide a brief, easy-to-understand summary for the medication "${medicationName}". Include its primary use, common dosage forms, and 2-3 important side effects. Format it as plain text, not markdown. For example:
  
  Primary Use: [Description]
  Common Forms: [Description]
  Key Side Effects: [Side effect 1], [Side effect 2].
  
  This information is for general knowledge and not a substitute for professional medical advice.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching medication info from Gemini:", error);
    return "Could not retrieve information for this medication. Please try again later.";
  }
};
   