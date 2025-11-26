import React from 'react';

const HeroBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-gray-900">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 opacity-80" />

            {/* Animated blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

            {/* Overlay mesh/grid (optional, for texture) */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
    );
};

export default HeroBackground;
