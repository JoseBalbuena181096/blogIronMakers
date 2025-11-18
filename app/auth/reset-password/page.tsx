import Link from 'next/link';
import ResetPasswordForm from './ResetPasswordForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Restablecer Contraseña - Iron Makers & AI',
  description: 'Crea una nueva contraseña para tu cuenta',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img 
              src="https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_oficial.svg" 
              alt="Iron Makers" 
              className="w-10 h-10 rounded-full"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Iron Makers & AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
