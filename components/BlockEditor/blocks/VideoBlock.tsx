import { BloqueVideo } from '@/types/database';
import { useEffect } from 'react';

interface VideoBlockProps {
    block: BloqueVideo;
    onChange: (updatedBlock: BloqueVideo) => void;
}

export default function VideoBlock({ block, onChange }: VideoBlockProps) {
    const handleChange = (field: string, value: any) => {
        onChange({
            ...block,
            contenido: {
                ...block.contenido,
                [field]: value,
            },
        });
    };

    // Auto-extract YouTube ID
    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleUrlChange = (url: string) => {
        const videoId = extractYoutubeId(url);
        onChange({
            ...block,
            contenido: {
                ...block.contenido,
                url,
                videoId: videoId || block.contenido.videoId,
                tipo: 'youtube' // Defaulting to youtube for now as per request context
            },
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    URL del Video (YouTube)
                </label>
                <input
                    type="text"
                    value={block.contenido.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        ID del Video
                    </label>
                    <input
                        type="text"
                        value={block.contenido.videoId}
                        onChange={(e) => handleChange('videoId', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm bg-gray-50 dark:bg-gray-800"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Tipo
                    </label>
                    <select
                        value={block.contenido.tipo}
                        onChange={(e) => handleChange('tipo', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
