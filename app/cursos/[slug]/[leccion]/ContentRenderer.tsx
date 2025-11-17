'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import type { ContenidoBloque } from '@/types/database';

interface ContentRendererProps {
  content: ContenidoBloque[] | any;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  if (!content || !Array.isArray(content)) {
    return (
      <div className="text-gray-500 dark:text-gray-400 italic">
        No hay contenido disponible
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      {content.map((bloque: ContenidoBloque, index: number) => {
        switch (bloque.tipo) {
          case 'texto':
            return <TextoBloque key={index} bloque={bloque} />;
          case 'codigo':
            return <CodigoBloque key={index} bloque={bloque} />;
          case 'latex':
            return <LatexBloque key={index} bloque={bloque} />;
          case 'imagen':
            return <ImagenBloque key={index} bloque={bloque} />;
          case 'video':
            return <VideoBloque key={index} bloque={bloque} />;
          case 'markdown':
            return <MarkdownBloque key={index} bloque={bloque} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function TextoBloque({ bloque }: { bloque: any }) {
  const { texto, formato } = bloque.contenido;

  switch (formato) {
    case 'titulo':
      return <h2 className="text-3xl font-bold mt-8 mb-4">{texto}</h2>;
    case 'subtitulo':
      return <h3 className="text-2xl font-semibold mt-6 mb-3">{texto}</h3>;
    case 'lista':
      const items = texto.split('\n').filter((item: string) => item.trim());
      return (
        <ul className="list-disc list-inside space-y-2 my-4">
          {items.map((item: string, i: number) => (
            <li key={i}>{item.replace(/^-\s*/, '')}</li>
          ))}
        </ul>
      );
    default:
      return <p className="my-4 leading-relaxed">{texto}</p>;
  }
}

function CodigoBloque({ bloque }: { bloque: any }) {
  const { codigo, lenguaje, mostrarLineas } = bloque.contenido;

  return (
    <div className="my-6 rounded-lg overflow-hidden">
      <SyntaxHighlighter
        language={lenguaje || 'python'}
        style={vscDarkPlus}
        showLineNumbers={mostrarLineas !== false}
        customStyle={{
          padding: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        {codigo}
      </SyntaxHighlighter>
    </div>
  );
}

function LatexBloque({ bloque }: { bloque: any }) {
  const { formula, inline } = bloque.contenido;

  return (
    <div className="my-6">
      {inline ? (
        <InlineMath math={formula} />
      ) : (
        <div className="flex justify-center">
          <BlockMath math={formula} />
        </div>
      )}
    </div>
  );
}

function ImagenBloque({ bloque }: { bloque: any }) {
  const { url, alt, caption } = bloque.contenido;

  return (
    <figure className="my-6">
      <img src={url} alt={alt} className="rounded-lg w-full shadow-lg" />
      {caption && (
        <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBloque({ bloque }: { bloque: any }) {
  const { tipo, videoId } = bloque.contenido;

  let embedUrl = '';

  if (tipo === 'youtube') {
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (tipo === 'vimeo') {
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className="my-6">
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function MarkdownBloque({ bloque }: { bloque: any }) {
  const { markdown } = bloque.contenido;

  // Renderizado simple de markdown (para producción usar una librería como react-markdown)
  return (
    <div
      className="my-4"
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
}
