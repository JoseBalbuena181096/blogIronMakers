'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import QuizModal from './QuizModal';

export default function CompleteButton({
  userId,
  entradaId,
  cursoSlug,
  nextLeccionSlug,
}: {
  userId: string;
  entradaId: string;
  cursoSlug: string;
  nextLeccionSlug?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      // Verificar si hay quiz para esta lección
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_preguntas')
        .select('id')
        .eq('entrada_id', entradaId)
        .limit(1);

      if (quizError) throw quizError;

      // Si hay quiz, mostrar modal
      if (quizData && quizData.length > 0) {
        setShowQuiz(true);
        setLoading(false);
        return;
      }

      // Si no hay quiz, marcar como completado directamente
      await marcarComoCompletado();
    } catch (err) {
      console.error('Error al verificar quiz:', err);
      setLoading(false);
    }
  };

  const marcarComoCompletado = async () => {
    try {
      const supabase = createClient();

      // Marcar como completado
      const { error } = await supabase
        .from('progreso_lecciones')
        .update({
          completado: true,
          fecha_completado: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('entrada_id', entradaId);

      if (error) throw error;

      // Si hay siguiente lección, redirigir
      if (nextLeccionSlug) {
        router.push(`/cursos/${cursoSlug}/${nextLeccionSlug}`);
      } else {
        // Si es la última, volver al curso
        router.push(`/cursos/${cursoSlug}`);
      }

      router.refresh();
    } catch (err) {
      console.error('Error al completar lección:', err);
      alert('Error al marcar la lección como completada');
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    if (passed) {
      await marcarComoCompletado();
    }
    setShowQuiz(false);
  };

  return (
    <>
      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verificando...' : '✓ Marcar como Completada'}
      </button>

      {showQuiz && (
        <QuizModal
          entradaId={entradaId}
          onQuizComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}