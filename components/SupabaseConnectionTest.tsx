'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('cursos').select('count');
        
        if (error) {
          // Si la tabla no existe aún, es normal
          if (error.message.includes('relation "public.cursos" does not exist')) {
            setStatus('connected');
            setError('Conexión exitosa. Tablas pendientes de crear.');
          } else {
            setStatus('error');
            setError(error.message);
          }
        } else {
          setStatus('connected');
          setError(null);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    }

    checkConnection();
  }, []);

  return (
    <div className={`p-4 rounded-lg border-2 ${
      status === 'checking' ? 'bg-yellow-50 border-yellow-500' :
      status === 'connected' ? 'bg-green-50 border-green-500' :
      'bg-red-50 border-red-500'
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {status === 'checking' ? '⏳' : status === 'connected' ? '✅' : '❌'}
        </div>
        <div>
          <h3 className={`font-semibold ${
            status === 'checking' ? 'text-yellow-800' :
            status === 'connected' ? 'text-green-800' :
            'text-red-800'
          }`}>
            {status === 'checking' ? 'Verificando conexión...' :
             status === 'connected' ? 'Conectado a Supabase' :
             'Error de conexión'}
          </h3>
          {error && (
            <p className="text-sm mt-1 text-gray-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
