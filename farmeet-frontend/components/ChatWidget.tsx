'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: {
        id: number;
        name: string;
        location: string;
        imageUrl: string;
        rating?: number;
        reviewCount?: number;
        reason?: string;
    }[];
}

const WELCOME_SHOWN_KEY = 'farmeet_chat_welcome_shown';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'こんにちは！FarMeetへようこそ🌿\n農園検索や予約方法など、なんでもお聞きください！',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Show welcome popup on first visit
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
        if (!hasSeenWelcome) {
            // Delay to let the page load first
            const timer = setTimeout(() => {
                setShowWelcome(true);
                // Auto-hide after 8 seconds
                setTimeout(() => {
                    setShowWelcome(false);
                    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
                }, 8000);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleOpenChat = () => {
        setIsOpen(true);
        setShowWelcome(false);
        localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Build history for context (excluding the welcome message)
            const history = messages.slice(1).map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await api.sendChatMessage(userMessage, history);

            if (response.success) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: response.message,
                        suggestions: response.suggestions,
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: response.error || '申し訳ありません。エラーが発生しました。',
                    },
                ]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: '申し訳ありません。接続エラーが発生しました。しばらくしてからもう一度お試しください。',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Welcome Popup */}
            {showWelcome && !isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 max-w-[280px] animate-fade-in-up cursor-pointer"
                    onClick={handleOpenChat}
                >
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                        {/* Arrow pointing to button */}
                        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-xl">🌿</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    何かお探しですか？
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    AIアシスタントが農園探しをお手伝いします！
                                </p>
                            </div>
                        </div>

                        <button
                            className="mt-3 w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            onClick={handleOpenChat}
                        >
                            チャットを始める
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Button - Enhanced visibility */}
            <div className="fixed bottom-6 right-6 z-50">
                {/* Pulse ring effect (only when closed) */}
                {!isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute h-16 w-16 rounded-full bg-green-400 animate-ping opacity-30"></div>
                    </div>
                )}

                <button
                    onClick={() => isOpen ? setIsOpen(false) : handleOpenChat()}
                    className={`relative flex items-center gap-2 rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:scale-105 ${isOpen ? 'h-14 w-14 justify-center' : 'h-14 px-5 pr-6'
                        }`}
                    aria-label="チャットを開く"
                >
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <>
                            <MessageCircle className="h-6 w-6" />
                            <span className="text-sm font-medium whitespace-nowrap">AIに質問</span>
                        </>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl border border-gray-200 animate-fade-in-up bottom-24 right-4 left-4 h-[70vh] max-h-[500px] rounded-2xl sm:left-auto sm:w-[380px]">
                    {/* Header */}
                    <div className="bg-green-600 px-4 py-4 text-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">FarMeet アシスタント</h3>
                                    <p className="text-sm text-green-100">AIがお手伝いします</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                                aria-label="閉じる"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                        ? 'bg-green-600 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                    {/* Farm Suggestions */}
                                    {message.suggestions && message.suggestions.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-gray-500 font-medium">おすすめの農園:</p>
                                            {message.suggestions.map((farm) => (
                                                <Link
                                                    key={farm.id}
                                                    href={`/farms/${farm.id}`}
                                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                                                        {farm.imageUrl ? (
                                                            <img
                                                                src={farm.imageUrl}
                                                                alt={farm.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-lg">🌿</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {farm.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {farm.location}
                                                            </span>
                                                            {farm.rating && (
                                                                <span className="flex items-center gap-1">
                                                                    ⭐ {farm.rating.toFixed(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {farm.reason && (
                                                            <p className="text-xs text-purple-600 mt-1 line-clamp-2">
                                                                💡 {farm.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                        <span className="text-sm text-gray-500">考え中...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 bg-white p-3">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="メッセージを入力..."
                                className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-400">
                            AIアシスタントが回答します
                        </p>
                    </div>
                </div>
            )}

            {/* Inline styles for animations */}
            <style jsx global>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes bounce-gentle {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                
                .animate-bounce-gentle {
                    animation: bounce-gentle 1s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
