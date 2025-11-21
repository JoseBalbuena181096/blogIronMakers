'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface IngestButtonProps {
    entradaId: string;
    onSuccess?: () => void;
}

export default function IngestButton({ entradaId, onSuccess }: IngestButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);
    const supabase = createClientComponentClient();

    const handleIngest = async () => {
        setIsLoading(true);
        try {
            // Obtener sesión actual
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error('Debes iniciar sesión');
                return;
            }

            // Llamar a Edge Function
            const { data, error } = await supabase.functions.invoke('ingest-proxy', {
                body: { entrada_id: entradaId },
            });

            if (error) throw error;

            if (data.success) {
                toast.success(data.message || 'Clase procesada correctamente');
                setIsProcessed(true);
                onSuccess?.();
            } else {
                toast.error(data.message || 'Error al procesar');
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al procesar la clase');
        } finally {
            setIsLoading(false);
        }
    };

    if (isProcessed) {
        return (
            <Button disabled variant="outline" className="gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Procesada
            </Button>
        );
    }

    return (
        <Button
            onClick={handleIngest}
            disabled={isLoading}
            className="gap-2"
            variant="default"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" />
                    Procesar con IA
                </>
            )}
        </Button>
    );
}
