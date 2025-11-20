import { BloqueImagen } from '@/types/database';

interface ImageBlockProps {
    block: BloqueImagen;
    onChange: (updatedBlock: BloqueImagen) => void;
}

export default function ImageBlock({ block, onChange }: ImageBlockProps) {
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
                    URL de la Imagen
                </label>
                <input
                    type="text"
                    value={block.contenido.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    placeholder="https://..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Texto Alternativo (Alt)
                    </label>
                    <input
                        type="text"
                        value={block.contenido.alt}
                        onChange={(e) => handleChange('alt', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        placeholder="Descripción de la imagen"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Pie de Foto (Caption)
                    </label>
                    <input
                        type="text"
                        value={block.contenido.caption || ''}
                        onChange={(e) => handleChange('caption', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        placeholder="Opcional"
                    />
                </div>
            </div>
            {block.contenido.url && (
                <div className="mt-2 relative aspect-video bg-gray-100 dark:bg-gray-900 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                        src={block.contenido.url}
                        alt={block.contenido.alt}
                        className="object-contain w-full h-full"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                </div>
            )}
        </div>
    );
}
