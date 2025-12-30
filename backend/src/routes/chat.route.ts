import { chatController } from '../controllers/chat.controller';
import { DepthLevel, TaskMode } from '../types/index';

export const ChatRoutes = {
  
  sendMessage: async (
    message: string, 
    depth: DepthLevel, 
    mode: TaskMode, 
    image?: { data: string; mimeType: string }
  ) => {
    return await chatController.handleChat(message, depth, mode, image);
  },

  initialize: (apiKey: string) => {
    chatController.initialize(apiKey);
    return { success: true };
  }
};
