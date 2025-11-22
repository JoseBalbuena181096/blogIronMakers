'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LessonVisibilityToggleProps {
    entradaId: string;
    initialPublicado: boolean;
}

export default function LessonVisibilityToggle({ entradaId, initialPublicado }: LessonVisibilityToggleProps) {
    const [publicado, setPublicado] = useState(initialPublicado);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleVisibility = async () => {
        setLoading(true);
        const supabase = createClient();
        const newValue = !publicado;

        try {
            const { error } = await supabase
                .from('entradas')
                .update({ publicado: newValue })
                .eq('id', entradaId);

            if (error) throw error;

            setPublicado(newValue);
            router.refresh();
        } catch (error) {
            console.error('Error updating visibility:', error);
            alert('Error al actualizar la visibilidad de la lección');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2" title={publicado ? 'Público - Visible para todos' : 'Borrador - Solo visible para admins'}>
            <span className={`text-xs font-medium ${publicado ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {publicado ? 'Público' : 'Borrador'}
            </span>
            <button
                onClick={toggleVisibility}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${publicado ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
            >
                <span
                    className={`${publicado ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    );
}
