import { GoogleGenAI } from "@google/genai";
import { DepthLevel, TaskMode } from '../types/index';
import { promptBuilder } from './promptBuilder';
import { ethicsGuard } from './ethicsGuard';
import { logger } from '../utils/logger';

class GeminiClient {
  private client: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  public initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey });
  }

  public isInitialized(): boolean {
    return !!this.client;
  }

  public async sendMessage(
    message: string,
    depth: DepthLevel,
    mode: TaskMode,
    image?: { data: string; mimeType: string }
  ): Promise<{ text: string; ethicsFlag: boolean }> {
    if (!this.client) throw new Error("API Key not set");

    const { safeInput, flag } = ethicsGuard.sanitizeInput(message, mode);
    const systemInstruction = promptBuilder.buildSystemInstruction(depth, mode);
    const finalPrompt = promptBuilder.formatUserMessage(safeInput);

    try {
      // Construct parts: Image must come before text if present, or just text
      const parts: any[] = [];
      
      if (image) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data
          }
        });
      }
      
      parts.push({ text: finalPrompt });

      const response = await this.client.models.generateContent({
        model: "gemini-3-flash-preview", // Using flash-preview for general tasks as per guidelines
        config: {
          systemInstruction: systemInstruction,
        },
        contents: { parts }
      });

      let responseText = response.text || "";

      if (mode === TaskMode.Assignment) {
        responseText = ethicsGuard.validateOutput(responseText);
      }

      logger.logInteraction(finalPrompt, responseText, depth, mode, flag);

      return { text: responseText, ethicsFlag: flag };

    } catch (error) {
      console.error("Gemini API Error:", error);
      return { 
        text: "I'm having trouble connecting to my knowledge base right now. Please check your connection or API key.", 
        ethicsFlag: false 
      };
    }
  }
}

export const geminiClient = new GeminiClient();
