'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    files?: { name: string; type: string; url: string }[]; // For displaying attached files
}

interface FileAttachment {
    filename: string;
    mime_type: string;
    data: string; // base64
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
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Resize state
    const [size, setSize] = useState({ width: 384, height: 500 }); // Default w-96 (384px)
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

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

    // Resize handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizeRef.current) return;

            const deltaX = resizeRef.current.startX - e.clientX;
            const deltaY = resizeRef.current.startY - e.clientY;

            setSize({
                width: Math.max(300, resizeRef.current.startWidth + deltaX),
                height: Math.max(400, resizeRef.current.startHeight + deltaY)
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeRef.current = null;
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'nw-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isResizing]);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: size.width,
            startHeight: size.height
        };
    };

    // Helper function to convert File to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:image/png;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachedFiles(prev => [...prev, ...files]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

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

        // Prepare file info for display in message
        const messageFiles = attachedFiles.map(file => ({
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file) // Create temporary URL for preview
        }));

        const userMessage: Message = {
            role: 'user',
            content: input,
            files: messageFiles.length > 0 ? messageFiles : undefined
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Create a placeholder for the assistant's message
        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '' },
        ]);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: 'Por favor, inicia sesión para usar el chat.' };
                    return newMessages;
                });
                setIsAuthenticated(false);
                setIsTyping(false);
                return;
            }

            const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-proxy`;

            // Prepare history: use current messages state (which doesn't include the new user message yet)
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Process attached files
            const fileAttachments: FileAttachment[] = [];
            for (const file of attachedFiles) {
                try {
                    const base64 = await fileToBase64(file);
                    fileAttachments.push({
                        filename: file.name,
                        mime_type: file.type,
                        data: base64
                    });
                } catch (error) {
                    console.error('Error converting file:', error);
                }
            }

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    query: userMessage.content,
                    entrada_id: entradaId,
                    history: conversationHistory,
                    files: fileAttachments.length > 0 ? fileAttachments : undefined
                }),
            });

            // Clear attached files after sending
            setAttachedFiles([]);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedResponse = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });

                    // Simulate typewriter effect by processing character by character
                    for (let i = 0; i < chunk.length; i++) {
                        accumulatedResponse += chunk[i];

                        // Update the last message with the accumulated response
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg.role === 'assistant') {
                                newMessages[newMessages.length - 1] = {
                                    ...lastMsg,
                                    content: accumulatedResponse
                                };
                            }
                            return newMessages;
                        });

                        // Add delay between characters (typewriter effect)
                        // Faster for spaces, slower for regular characters
                        const delay = chunk[i] === ' ' ? 10 : 30;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

        } catch (error: any) {
            console.error('Error completo:', error);

            let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';

            if (error.message?.includes('Unauthorized')) {
                errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                setIsAuthenticated(false);
            }

            setMessages((prev) => {
                const newMessages = [...prev];
                // If the last message was the empty placeholder, update it with error
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: errorMessage };
                } else {
                    newMessages.push({ role: 'assistant', content: errorMessage });
                }
                return newMessages;
            });
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
        <div
            className={`fixed bottom-4 right-4 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${className}`}
            style={{ width: size.width, height: size.height, maxHeight: 'calc(100vh - 2rem)' }}
        >
            {/* Resize Handle */}
            <div
                className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-50 flex items-center justify-center group"
                onMouseDown={startResizing}
            >
                <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-blue-500 transition-colors"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg cursor-move">
                <div className="flex items-center gap-3">
                    <img
                        src="https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_oficial.svg"
                        alt="IronBot Logo"
                        className="w-8 h-8 rounded-full bg-white p-0.5"
                    />
                    <div>
                        <h3 className="font-bold text-lg">IronBot</h3>
                        <span className="text-xs text-blue-100 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </span>
                    </div>
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
                            {message.role === 'user' ? (
                                <div className="space-y-2">
                                    {/* Display attached files */}
                                    {message.files && message.files.length > 0 && (
                                        <div className="space-y-2 mb-2">
                                            {message.files.map((file, fileIndex) => (
                                                <div key={fileIndex} className="bg-white/10 rounded p-2">
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="max-w-full h-auto rounded max-h-48 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="truncate">{file.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Display text content */}
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            ) : (
                                <div className="text-sm prose dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 rounded-tl-none">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Thinking...</span>
                            </div>
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

                {/* File Preview */}
                {attachedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg text-sm">
                                <span className="text-blue-700 dark:text-blue-300 truncate max-w-[150px]">
                                    {file.name}
                                </span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                    aria-label="Eliminar archivo"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.py,.cpp,.c,.h,.js,.ts,.sql,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                />

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

                    {/* Attach file button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTyping || isAuthenticated === false}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Adjuntar archivo"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

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
