'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ContenidoBloque } from '@/types/database';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
  });
}

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
  const { texto } = bloque.contenido;

  // Renderizar como Markdown por defecto para permitir formato enriquecido
  return (
    <div className="my-4 prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mt-5 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 my-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 my-4" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
            ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700 last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-700 last:border-r-0" {...props} />
          ),
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  );
}

function MermaidDiagram({ codigo }: { codigo: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, codigo);
        containerRef.current.innerHTML = svg;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al renderizar el diagrama');
        console.error('Mermaid rendering error:', err);
      }
    };

    renderDiagram();
  }, [codigo]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-2">Error en diagrama Mermaid:</p>
        <p className="text-red-500 dark:text-red-300 text-xs font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}

function CodigoBloque({ bloque }: { bloque: any }) {
  const { codigo, lenguaje, mostrarLineas } = bloque.contenido;

  // Render Mermaid diagrams
  if (lenguaje === 'mermaid') {
    return <MermaidDiagram codigo={codigo} />;
  }

  // Render code with syntax highlighting
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
  const { url, alt, caption, width = 100 } = bloque.contenido;

  return (
    <figure className="my-6 flex flex-col items-center">
      <img
        src={url}
        alt={alt}
        className="rounded-lg shadow-lg max-w-full"
        style={{ width: `${width}%` }}
      />
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
