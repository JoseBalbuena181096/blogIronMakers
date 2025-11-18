'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar que el usuario viene del enlace de recuperación
    const checkAccess = async () => {
      try {
        const supabase = createClient();
        
        // Obtener el hash fragment que contiene el token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
          // Establecer la sesión con los tokens del enlace
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Error setting session:', error);
            setHasAccess(false);
          } else {
            setHasAccess(true);
          }
        } else {
          // Verificar si ya hay una sesión activa
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        }
      } catch (err) {
        console.error('Error checking access:', err);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      alert('✅ Contraseña actualizada correctamente');
      router.push('/auth/login');
    } catch (error: any) {
      setError(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Verificando acceso...
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Enlace Inválido o Expirado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          El enlace de recuperación puede haber expirado o ya fue usado
        </p>
        <a
          href="/auth/recuperar"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Solicitar Nuevo Enlace
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Repite la contraseña"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="showPassword"
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="showPassword" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Mostrar contraseñas
        </label>
      </div>

      {password && confirmPassword && (
        <div className="text-sm">
          {password === confirmPassword ? (
            <p className="text-green-600 dark:text-green-400">✓ Las contraseñas coinciden</p>
          ) : (
            <p className="text-red-600 dark:text-red-400">✗ Las contraseñas no coinciden</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || password !== confirmPassword}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
      </button>
    </form>
  );
}
