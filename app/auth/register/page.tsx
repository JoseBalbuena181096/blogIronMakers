import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  const user = await getUser();

  // Si ya está autenticado, redirigir
  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Regístrate para llevar el control de tu progreso y obtener certificados
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Inicia sesión aquí
          </a>
        </div>
      </div>
    </div>
  );
}
