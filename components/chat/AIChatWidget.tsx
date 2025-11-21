'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClientComponentClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isTyping) return;

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
                setIsTyping(false);
                return;
            }

            // Llamar a Edge Function
            const { data, error } = await supabase.functions.invoke('chat-proxy', {
                body: {
                    query: userMessage.content,
                    entrada_id: entradaId,
                },
            });

            if (error) throw error;

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.response },
            ]);
        } catch (error: any) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
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
            <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg',
                    className
                )}
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card
            className={cn(
                'fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-2xl',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Asistente IA</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        ¡Hola! Soy tu asistente de IA. Pregúntame lo que quieras sobre esta clase.
                    </div>
                )}
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                            'flex',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[80%] rounded-lg px-4 py-2',
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            )}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu pregunta..."
                        disabled={isTyping}
                        className="flex-1"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
