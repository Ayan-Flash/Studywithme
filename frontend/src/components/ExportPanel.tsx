import React, { useState } from 'react';
import { Download, FileText, Copy, Check, Share2, X, FileJson, Book } from 'lucide-react';
import { Message } from '../types/index.ts';

interface ExportPanelProps {
    messages: Message[];
    onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ messages, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [exportFormat, setExportFormat] = useState<'txt' | 'md' | 'json' | 'pdf'>('md');

    const formatConversation = (format: 'txt' | 'md' | 'json'): string => {
        const filteredMessages = messages.filter(m => m.role !== 'system');

        if (format === 'json') {
            return JSON.stringify(filteredMessages, null, 2);
        }

        const header = format === 'md'
            ? `# StudyWithMe Conversation\n\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`
            : `StudyWithMe Conversation\nDate: ${new Date().toLocaleDateString()}\n\n`;

        return header + filteredMessages.map(m => {
            const role = m.role === 'user' ? '**You**' : '**StudyWithMe**';
            const time = new Date(m.timestamp).toLocaleTimeString();

            if (format === 'md') {
                return `### ${role} (${time})\n\n${m.content}\n\n`;
            } else {
                return `[${role}] (${time})\n${m.content}\n\n`;
            }
        }).join('');
    };

    const handleCopy = () => {
        const content = formatConversation(exportFormat === 'pdf' ? 'txt' : exportFormat);
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const content = formatConversation(exportFormat === 'pdf' ? 'txt' : exportFormat);
        const mimeTypes: Record<string, string> = {
            txt: 'text/plain',
            md: 'text/markdown',
            json: 'application/json'
        };

        const blob = new Blob([content], { type: mimeTypes[exportFormat] || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studywithme-conversation-${Date.now()}.${exportFormat === 'pdf' ? 'txt' : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        const content = formatConversation('txt');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'StudyWithMe Conversation',
                    text: content.slice(0, 500) + '...',
                });
            } catch (e) {
                // User cancelled or share failed
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Download size={20} />
                        Export Conversation
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">Export Format</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'md', label: 'Markdown', icon: FileText, desc: 'For Notion, Obsidian' },
                                { id: 'txt', label: 'Plain Text', icon: FileText, desc: 'Universal format' },
                                { id: 'json', label: 'JSON', icon: FileJson, desc: 'For developers' },
                                { id: 'pdf', label: 'PDF Ready', icon: Book, desc: 'Print-friendly' },
                            ].map(format => (
                                <button
                                    key={format.id}
                                    onClick={() => setExportFormat(format.id as any)}
                                    className={`p-3 rounded-xl border text-left transition-all ${exportFormat === format.id
                                            ? 'bg-indigo-500/20 border-indigo-500'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <format.icon size={16} className={exportFormat === format.id ? 'text-indigo-400' : 'text-slate-400'} />
                                        <span className={`font-medium ${exportFormat === format.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            {format.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{format.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Preview</label>
                        <div className="bg-slate-800 rounded-lg p-3 h-32 overflow-y-auto text-xs text-slate-400 font-mono">
                            {formatConversation(exportFormat === 'pdf' ? 'txt' : exportFormat).slice(0, 500)}...
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                        <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{messages.length}</p>
                            <p className="text-xs text-slate-500">Messages</p>
                        </div>
                        <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">
                                {Math.round(formatConversation('txt').length / 1024)}KB
                            </p>
                            <p className="text-xs text-slate-500">File Size</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-800 flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-3 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="py-3 px-4 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-colors"
                    >
                        <Share2 size={18} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportPanel;
