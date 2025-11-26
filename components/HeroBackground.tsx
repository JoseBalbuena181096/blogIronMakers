import React from 'react';

const HeroBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-gray-900">
            {/* Base gradient - azul oscuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 opacity-80" />

            {/* Animated waves - solo azules */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-flow" />
            <div className="absolute top-1/4 -right-4 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-flow" style={{ animationDelay: '2s', animationDuration: '18s' }} />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-flow" style={{ animationDelay: '4s', animationDuration: '20s' }} />

            {/* Overlay mesh/grid (optional, for texture) */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
    );
};

export default HeroBackground;
