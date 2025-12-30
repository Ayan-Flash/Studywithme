import React, { useState, useEffect } from 'react';
import { Message } from '../types/index.ts';
import { User, Bot, AlertTriangle, Volume2, Pause, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (isSpeaking || isPaused) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking, isPaused]);

  const handlePlayPause = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
    } else {
      // Start new speech
      window.speechSynthesis.cancel(); // Stop any other bubbles

      // Clean up markdown for better speech output
      const cleanText = message.content
        .replace(/[#*`]/g, '') // Remove basic markdown symbols
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove url
        .replace(/<[^>]*>/g, ''); // Remove HTML tags if any

      const newUtterance = new SpeechSynthesisUtterance(cleanText);

      newUtterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setUtterance(null);
      };

      newUtterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setUtterance(null);
      };

      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setUtterance(null);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
            {message.image && (
              <img
                src={`data:${message.image.mimeType};base64,${message.image.data}`}
                alt="User upload"
                className="max-w-full h-auto rounded-lg mb-2 border border-white/10"
                style={{ maxHeight: '200px' }}
              />
            )}
            {message.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-white prose-code:text-indigo-300">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-3">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

            {!isUser && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2 ml-1">
                <button
                  onClick={handlePlayPause}
                  className={`transition-colors p-1 rounded-md ${isSpeaking ? 'text-indigo-400 bg-indigo-500/10' : 'hover:text-indigo-400 hover:bg-slate-800'}`}
                  title={isSpeaking ? "Pause" : "Read Aloud"}
                >
                  {isSpeaking ? <Pause size={12} /> : <Volume2 size={12} />}
                </button>

                {(isSpeaking || isPaused) && (
                  <button
                    onClick={handleStop}
                    className="hover:text-red-400 hover:bg-slate-800 transition-colors p-1 rounded-md"
                    title="Stop"
                  >
                    <Square size={12} />
                  </button>
                )}
              </div>
            )}

            {message.metadata?.mode === 'Assignment' && !isUser && (
              <span className="flex items-center text-amber-500 gap-1 ml-2">
                <AlertTriangle size={10} /> Assignment Mode
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};