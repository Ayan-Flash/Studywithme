import { useState } from 'react';
import { apiClient } from '../utils/apiClient.ts';
import { Message, DepthLevel, TaskMode } from '../types/index.ts';

export const useChat = () => {
    const [loading, setLoading] = useState(false);

    const sendMessage = async (message: string, depth: DepthLevel, mode: TaskMode) => {
        setLoading(true);
        try {
            const response = await apiClient.chat.sendMessage(message, depth, mode);
            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            return { text: "Error sending message", ethicsFlag: false, error: "Network error" };
        }
    };

    return { sendMessage, loading };
};