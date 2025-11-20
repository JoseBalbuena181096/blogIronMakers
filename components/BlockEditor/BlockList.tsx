import { ContenidoBloque } from '@/types/database';
import TextBlock from './blocks/TextBlock';
import CodeBlock from './blocks/CodeBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import LatexBlock from './blocks/LatexBlock';

interface BlockListProps {
    blocks: ContenidoBloque[];
    onChange: (blocks: ContenidoBloque[]) => void;
}

export default function BlockList({ blocks, onChange }: BlockListProps) {
    const handleBlockChange = (index: number, updatedBlock: ContenidoBloque) => {
        const newBlocks = [...blocks];
        newBlocks[index] = updatedBlock;
        onChange(newBlocks);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === blocks.length - 1)
        ) {
            return;
        }

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        // Update 'orden' property
        newBlocks.forEach((block, idx) => {
            block.orden = idx;
        });

        onChange(newBlocks);
    };

    const deleteBlock = (index: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este bloque?')) {
            const newBlocks = blocks.filter((_, i) => i !== index);
            // Update 'orden' property
            newBlocks.forEach((block, idx) => {
                block.orden = idx;
            });
            onChange(newBlocks);
        }
    };

    const renderBlockEditor = (block: ContenidoBloque, index: number) => {
        const commonProps = {
            block: block as any, // Type assertion needed because of discriminated union
            onChange: (updatedBlock: any) => handleBlockChange(index, updatedBlock),
        };

        switch (block.tipo) {
            case 'texto':
                return <TextBlock {...commonProps} />;
            case 'codigo':
                return <CodeBlock {...commonProps} />;
            case 'imagen':
                return <ImageBlock {...commonProps} />;
            case 'video':
                return <VideoBlock {...commonProps} />;
            case 'latex':
                return <LatexBlock {...commonProps} />;
            default:
                return <div className="text-red-500">Tipo de bloque desconocido: {block.tipo}</div>;
        }
    };

    if (blocks.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                    No hay bloques de contenido. Agrega uno usando los botones de la izquierda.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {blocks.map((block, index) => (
                <div
                    key={block.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
                >
                    {/* Header del bloque */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                                {block.tipo.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">ID: {block.id}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500"
                                title="Mover arriba"
                            >
                                ⬆️
                            </button>
                            <button
                                type="button"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === blocks.length - 1}
                                className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500"
                                title="Mover abajo"
                            >
                                ⬇️
                            </button>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                            <button
                                type="button"
                                onClick={() => deleteBlock(index)}
                                className="p-1.5 text-gray-500 hover:text-red-600"
                                title="Eliminar bloque"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Contenido del editor */}
                    <div className="p-4">
                        {renderBlockEditor(block, index)}
                    </div>
                </div>
            ))}
        </div>
    );
}
