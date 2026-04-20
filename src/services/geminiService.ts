import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async analyzePartPhoto(base64Image: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                }
              },
              {
                text: "Você é um assistente especialista em peças automotivas para uma sucata. Analise esta imagem e sugira em formato JSON: { 'name': 'nome da peça', 'brand': 'marca provável', 'model': 'modelo provável', 'category': 'categoria', 'condition_guess': 'Novo|Conservado|Usado|Quebrado' }. Responda APENAS o JSON."
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw error;
    }
  }
};
