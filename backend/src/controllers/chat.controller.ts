import { geminiClient } from '../ai/geminiClient';
import { DepthLevel, TaskMode } from '../types/index';

export class ChatController {
  
  public async handleChat(
    message: string, 
    depth: DepthLevel, 
    mode: TaskMode,
    image?: { data: string; mimeType: string }
  ): Promise<{ text: string; ethicsFlag: boolean; error?: string }> {
    
    if (!geminiClient.isInitialized()) {
      return { 
        text: '', 
        ethicsFlag: false, 
        error: 'System not initialized. Please provide API Key.' 
      };
    }

    try {
      const response = await geminiClient.sendMessage(message, depth, mode, image);
      return response;
    } catch (error) {
      console.error('Chat Controller Error:', error);
      return {
        text: 'Sorry, I encountered an error processing your request.',
        ethicsFlag: false,
        error: 'Internal processing error'
      };
    }
  }

  public initialize(apiKey: string) {
    geminiClient.initialize(apiKey);
  }
}

export const chatController = new ChatController();
