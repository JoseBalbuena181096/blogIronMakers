import React from 'react';

const HeroBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-gray-900">
            {/* Base gradient - azul oscuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-950/30 to-gray-900" />

            {/* Multiple wave layers - azul blanquecino */}
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-wave-flow-1" />
            <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-cyan-300 rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-wave-flow-2" />
            <div className="absolute top-1/2 left-0 w-[700px] h-[400px] bg-blue-300 rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-wave-flow-3" />
            <div className="absolute bottom-1/4 left-0 w-[550px] h-[550px] bg-cyan-400 rounded-full mix-blend-screen filter blur-[110px] opacity-25 animate-wave-flow-1" style={{ animationDelay: '3s' }} />
            <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-blue-200 rounded-full mix-blend-screen filter blur-[90px] opacity-20 animate-wave-flow-2" style={{ animationDelay: '5s' }} />
        </div>
    );
};

export default HeroBackground;
