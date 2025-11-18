'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setMensaje({
        tipo: 'success',
        texto: '✅ Revisa tu correo. Te hemos enviado un enlace para restablecer tu contraseña.'
      });
      setEmail('');
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Error al enviar el correo de recuperación'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mensaje && (
        <div
          className={`p-4 rounded-lg ${
            mensaje.tipo === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="tu@email.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
      </button>
    </form>
  );
}
