import React from 'react';

export const PageLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl transition-all duration-700">
            {/* Cinematic Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse-gentle pointer-events-none" />
            
            <div className="relative flex flex-col items-center gap-8">
                {/* Rotating Ring */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-primary/40 animate-spin-slow shadow-[0_0_20px_hsl(var(--primary)/0.2)]" />
                    <div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-primary/20 animate-[spin_4s_linear_infinite_reverse]" />
                    
                    {/* Pulsing Core */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full blur-xl animate-pulse-gentle" />
                        <span className="relative text-3xl sm:text-4xl font-black italic tracking-tighter text-primary animate-pulse-gentle drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
                            TOMITO
                        </span>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1.5">
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i}
                                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
