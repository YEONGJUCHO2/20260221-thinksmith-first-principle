import React from 'react';

export default function ForgeLoader({ text = "분석 중..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-8 w-full">
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/10 border-t-primary animate-spin" style={{ animationDuration: '3s' }}></div>

                {/* Middle ring */}
                <div className="absolute inset-2 rounded-full border-2 border-white/5 border-l-white/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

                {/* Inner glowing core area */}
                <div className="absolute inset-8 bg-primary/20 rounded-full blur-md animate-pulse shadow-[0_0_30px_rgba(244,106,37,0.4)]"></div>

                {/* Center icon / Brain node */}
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-primary/90 text-3xl drop-shadow-[0_0_8px_rgba(244,106,37,0.8)]">
                        psychology
                    </span>
                </div>

                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 bg-warning rounded-full shadow-[0_0_8px_#ffb74d]"></div>
                </div>
            </div>

            <div className="px-6 py-2 relative flex items-center justify-center">
                <p className="text-primary text-xs font-bold tracking-widest uppercase animate-pulse drop-shadow-[0_0_5px_rgba(244,106,37,0.5)]">
                    {text}
                </p>
            </div>
        </div>
    );
}
