import { BloqueCodigo } from '@/types/database';

interface CodeBlockProps {
    block: BloqueCodigo;
    onChange: (updatedBlock: BloqueCodigo) => void;
}

export default function CodeBlock({ block, onChange }: CodeBlockProps) {
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Lenguaje
                    </label>
                    <select
                        value={block.contenido.lenguaje}
                        onChange={(e) => handleChange('lenguaje', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="sql">SQL</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="mermaid">Mermaid (Diagramas)</option>
                    </select>
                </div>
                <div className="flex items-center pt-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={block.contenido.mostrarLineas !== false}
                            onChange={(e) => handleChange('mostrarLineas', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar números de línea</span>
                    </label>
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Código
                </label>
                <textarea
                    value={block.contenido.codigo}
                    onChange={(e) => handleChange('codigo', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-900 text-gray-100 text-sm font-mono"
                    placeholder="// Escribe tu código aquí"
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
