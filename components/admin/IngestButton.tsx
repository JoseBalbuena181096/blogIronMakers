'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface IngestButtonProps {
    entradaId: string;
    onSuccess?: () => void;
}

export default function IngestButton({ entradaId, onSuccess }: IngestButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);
    const [message, setMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const supabase = createClient();

    // Check authentication status on mount
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

    const handleIngest = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setMessage('Debes iniciar sesión');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase.functions.invoke('ingest-proxy', {
                body: { entrada_id: entradaId },
            });

            if (error) {
                console.error('Error en ingest-proxy:', error);
                throw error;
            }

            if (data.success) {
                setMessage(data.message || 'Clase procesada correctamente');
                setIsProcessed(true);
                onSuccess?.();
            } else {
                setMessage(data.message || 'Error al procesar');
            }
        } catch (error: any) {
            console.error('Error completo:', error);
            
            let errorMessage = 'Error al procesar la clase';
            
            if (error.message?.includes('FunctionsRelayError')) {
                errorMessage = 'El servicio de procesamiento no está disponible. Contacta al administrador.';
            } else if (error.message?.includes('FunctionsFetchError')) {
                errorMessage = 'No se pudo conectar con el servicio. Verifica tu conexión.';
            } else if (error.message?.includes('Unauthorized')) {
                errorMessage = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
                setIsAuthenticated(false);
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isProcessed) {
        return (
            <button
                disabled
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-300 cursor-not-allowed"
            >
                ✅ Procesada
            </button>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleIngest}
                disabled={isLoading || isAuthenticated === false}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={isAuthenticated === false ? 'Debes iniciar sesión' : 'Procesar clase con IA'}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Procesando...
                    </>
                ) : (
                    <>
                        ✨ Procesar con IA
                    </>
                )}
            </button>
            {message && (
                <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
