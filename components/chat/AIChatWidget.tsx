'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatWidgetProps {
    entradaId?: string;
    className?: string;
}

export default function AIChatWidget({ entradaId, className }: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check authentication status on mount and when chat opens
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };

        checkAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const sendMessage = async () => {
        if (!input.trim() || isTyping) return;

        // Check authentication before sending
        if (isAuthenticated === false) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Por favor, inicia sesión para usar el chat.' },
            ]);
            return;
        }

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Por favor, inicia sesión para usar el chat.' },
                ]);
                setIsAuthenticated(false);
                setIsTyping(false);
                return;
            }

            const { data, error } = await supabase.functions.invoke('chat-proxy', {
                body: {
                    query: userMessage.content,
                    entrada_id: entradaId,
                },
            });

            if (error) {
                console.error('Error en chat-proxy:', error);
                throw error;
            }

            if (!data || !data.response) {
                console.error('Respuesta inválida del servidor:', data);
                throw new Error('Respuesta inválida del servidor');
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.response },
            ]);
        } catch (error: any) {
            console.error('Error completo:', error);
            
            let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
            
            // Mensajes de error más específicos
            if (error.message?.includes('FunctionsRelayError')) {
                errorMessage = 'El servicio de chat no está disponible en este momento. Por favor, contacta al administrador.';
            } else if (error.message?.includes('FunctionsFetchError')) {
                errorMessage = 'No se pudo conectar con el servicio de chat. Verifica tu conexión a internet.';
            } else if (error.message?.includes('Unauthorized')) {
                errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                setIsAuthenticated(false);
            }
            
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage,
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center ${className}`}
                aria-label="Abrir chat"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 w-96 h-[500px] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="font-semibold">Asistente IA</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 hover:bg-blue-700 rounded flex items-center justify-center"
                    aria-label="Cerrar chat"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                        {isAuthenticated === false ? (
                            <div>
                                <p className="mb-2">Por favor, inicia sesión para usar el chat.</p>
                                <a href="/auth/login" className="text-blue-600 hover:underline">
                                    Ir a login
                                </a>
                            </div>
                        ) : (
                            '¡Hola! Soy tu asistente de IA. Pregúntame lo que quieras sobre esta clase.'
                        )}
                    </div>
                )}
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                            <svg className="animate-spin h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated === false && (
                    <div className="mb-2 text-xs text-red-600 dark:text-red-400 text-center">
                        Debes iniciar sesión para enviar mensajes
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu pregunta..."
                        disabled={isTyping || isAuthenticated === false}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping || isAuthenticated === false}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Enviar mensaje"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
