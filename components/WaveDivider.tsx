import React from 'react';

interface WaveDividerProps {
    fill?: string;
    direction?: 'up' | 'down';
    className?: string;
}

const WaveDivider: React.FC<WaveDividerProps> = ({
    fill = 'fill-white',
    direction = 'down',
    className = ''
}) => {
    const isUp = direction === 'up';

    return (
        <div className={`absolute left-0 w-full overflow-hidden leading-none ${isUp ? 'bottom-full' : 'top-full'} ${className}`} style={{ height: '120px', zIndex: 1 }}>
            <svg
                className="relative block w-[200%] h-full animate-wave"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    className={`${fill} opacity-40`}
                />
                <path
                    d="M985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83Z"
                    className={`${fill} opacity-40`}
                    transform="translate(1200, 0)"
                />

                <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    className={fill}
                    style={{ animationDelay: '-5s' }}
                />
                <path
                    d="M985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83Z"
                    className={fill}
                    transform="translate(1200, 0)"
                    style={{ animationDelay: '-5s' }}
                />
            </svg>
        </div>
    );
};

export default WaveDivider;
