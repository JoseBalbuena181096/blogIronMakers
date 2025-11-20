import { BloqueTexto } from '@/types/database';

interface TextBlockProps {
    block: BloqueTexto;
    onChange: (updatedBlock: BloqueTexto) => void;
}

export default function TextBlock({ block, onChange }: TextBlockProps) {
    const handleChange = (field: string, value: any) => {
        onChange({
            ...block,
            contenido: {
                ...block.contenido,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Formato
                </label>
                <select
                    value={block.contenido.formato || 'normal'}
                    onChange={(e) => handleChange('formato', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                    <option value="normal">Normal</option>
                    <option value="markdown">Markdown</option>
                    <option value="titulo">Título</option>
                    <option value="subtitulo">Subtítulo</option>
                    <option value="lista">Lista</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Contenido
                </label>
                <textarea
                    value={block.contenido.texto}
                    onChange={(e) => handleChange('texto', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono"
                    placeholder="Escribe el contenido aquí..."
                />
            </div>
        </div>
    );
}
