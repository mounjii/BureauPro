
import { GoogleGenAI } from "@google/genai";
import { Product, ChatMessage } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fixed: Initialize GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getAssistantResponse(history: ChatMessage[], products: Product[]): Promise<string> {
    try {
      const productContext = products.map(p => 
        `- ${p.name} (${p.category}): ${p.description} Prix: ${p.price}€`
      ).join('\n');

      const systemInstruction = `
        Tu es l'assistant de BureauPro, un expert en matériel de bureau.
        Ta mission est d'aider les clients à trouver le meilleur produit dans notre catalogue.
        
        Catalogue actuel :
        ${productContext}

        Consignes:
        1. Sois poli, professionnel et serviable.
        2. Réponds en français.
        3. Recommande des produits spécifiques de notre catalogue quand c'est pertinent.
        4. Si un produit n'est pas dans le catalogue, suggère une alternative proche ou explique poliment que nous ne l'avons pas.
        5. Garde tes réponses concises et structurées.
      `;

      // Fixed: Map history to the format expected by the model (roles: user/model)
      const contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      // Fixed: Access the generated text using the .text property
      return response.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Une erreur est survenue lors de la communication avec l'assistant IA.";
    }
  }
}

export const geminiService = new GeminiService();
