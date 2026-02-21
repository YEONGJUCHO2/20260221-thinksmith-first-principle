import React, { useState, useEffect } from 'react';
import ForgeLoader from '@/components/ForgeLoader';

interface Step3Props {
    coreTruth: string;
    onNext: (solution: string) => void;
    onBack: () => void;
    onHome: () => void;
}

export default function Step3({ coreTruth, onNext, onBack, onHome }: Step3Props) {
    const [solution, setSolution] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCustomizing, setIsCustomizing] = useState(false);

    const fetchSolutions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "suggest_solutions",
                    payload: { coreTruths: [coreTruth] }
                })
            });
            const data = await res.json();
            if (data.result && Array.isArray(data.result)) {
                setSuggestions(data.result);
            }
        } catch (e) {
            console.error("Failed to load solutions", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolutions();
    }, [coreTruth]);

    const handleSelect = (text: string) => {
        setSolution(text);
        setIsCustomizing(true); // Populate the text area so they can edit it
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col pt-4 overflow-x-hidden relative">

            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md px-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="text-slate-400 p-2 -ml-2 text-xl hover:text-white transition-colors" title="이전 (심층 진단 다시하기)">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-1.5 opacity-80 flex-1 justify-center">
                        <span className="material-symbols-outlined text-primary text-base">rocket_launch</span>
                        <h1 className="text-white text-sm font-medium tracking-widest uppercase text-center focus:outline-none">2단계: 파격적 해결책</h1>
                    </div>
                    <button onClick={onHome} className="text-slate-400 p-2 -mr-2 text-xl hover:text-white transition-colors" title="처음으로">
                        <span className="material-symbols-outlined">home</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Phase 2: Reassembly</span>
                        <span className="text-warning">99% Complete</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-warning w-[95%] shadow-[0_0_10px_rgba(255,183,77,0.6)] transition-all duration-1000"></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-5 pt-8 pb-32 z-10">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold leading-tight mb-2">
                        오직 <span className="text-warning font-black tracking-tight">본질</span>에만 기반한<br />
                        10배 더 혁신적인 해결책.
                    </h2>
                </section>

                <section className="mb-8 relative group">
                    <div className="absolute -inset-0.5 bg-warning/20 rounded-2xl blur opacity-30"></div>
                    <div className="relative glass-morphism rounded-2xl p-5 border border-warning/30">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-warning text-sm">filter_center_focus</span>
                            <span className="text-warning/90 text-[10px] font-bold uppercase tracking-widest">도출된 단 하나의 진실</span>
                        </div>
                        <p className="text-white text-lg font-medium leading-relaxed">
                            "{coreTruth}"
                        </p>
                    </div>
                </section>

                <section className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-slate-400">smart_toy</span>
                            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400">씽크스미스의 제안</h3>
                        </div>
                        <button
                            onClick={fetchSolutions}
                            className="px-3 py-1.5 rounded-full border border-slate-700 bg-transparent hover:bg-white/5 text-xs text-slate-400 transition-all text-left flex items-center gap-1 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[12px]">refresh</span>
                            새로고침
                        </button>
                    </div>

                    {loading ? (
                        <ForgeLoader text="새로운 세계선을 만드는 중..." />
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((sug, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(sug)}
                                    className="w-full text-left p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-warning/10 hover:border-warning/50 transition-all group flex gap-3 items-start"
                                >
                                    <span className="material-symbols-outlined text-warning mt-0.5 opacity-50 group-hover:opacity-100">lightbulb</span>
                                    <p className="text-slate-200 font-medium leading-relaxed">{sug}</p>
                                </button>
                            ))}

                            {!isCustomizing && (
                                <button
                                    onClick={() => { setIsCustomizing(true); setSolution(""); }}
                                    className="w-full text-center py-4 text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    마음에 안 듭니다. 직접 적겠습니다.
                                </button>
                            )}
                        </div>
                    )}

                    {isCustomizing && (
                        <div className="mt-4 flex-1 flex flex-col animate-fade-in relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-warning/20 to-primary/0 rounded-2xl blur opacity-30 pointer-events-none"></div>
                            <textarea
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                className="relative z-10 flex-1 min-h-[150px] w-full bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl border border-warning/40 text-slate-100 text-lg leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-warning p-5 resize-none shadow-[0_5px_20px_rgba(0,0,0,0.3)] transition-all"
                                placeholder="당신만의 파격적인 해결책을 자유롭게 적어보세요..."
                            ></textarea>
                        </div>
                    )}
                </section>
            </main>

            <footer className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-40">
                <button
                    onClick={() => onNext(solution)}
                    disabled={!solution.trim()}
                    className="w-full h-16 rounded-xl bg-gradient-to-br from-warning to-primary border border-warning shadow-[0_5px_20px_rgba(255,183,77,0.3)] text-[#111] font-black text-lg tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group"
                >
                    결과 포스터 만들기
                    <span className="material-symbols-outlined text-background-dark group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                </button>
            </footer>
        </div>
    );
}
