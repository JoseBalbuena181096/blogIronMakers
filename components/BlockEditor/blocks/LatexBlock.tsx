import { BloqueLatex } from '@/types/database';

interface LatexBlockProps {
    block: BloqueLatex;
    onChange: (updatedBlock: BloqueLatex) => void;
}

export default function LatexBlock({ block, onChange }: LatexBlockProps) {
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
                    Fórmula LaTeX
                </label>
                <textarea
                    value={block.contenido.formula}
                    onChange={(e) => handleChange('formula', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono"
                    placeholder="E = mc^2"
                />
            </div>
            <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={block.contenido.inline || false}
                        onChange={(e) => handleChange('inline', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">En línea (Inline)</span>
                </label>
            </div>
        </div>
    );
}
