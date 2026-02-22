import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

interface ResultPosterProps {
    problem: string;
    coreTruth: string;
    solution: string;
    onSaveToFirebase: () => void;
    onRestart: () => void;
    isSaving: boolean;
    saveSuccess: boolean;
}

interface ActionPlan {
    timeframe_1h: string;
    timeframe_1w: string;
    mindset_shift: string;
    recommended_activity?: string;
}

export default function ResultPoster({
    problem,
    coreTruth,
    solution,
    onSaveToFirebase,
    onRestart,
    isSaving,
    saveSuccess
}: ResultPosterProps) {
    const posterRef = useRef<HTMLDivElement>(null);
    const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        const fetchActionPlan = async () => {
            setLoadingPlan(true);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: "generate_action_plan", payload: { solution } })
                });
                const data = await res.json();
                if (data.result) {
                    setActionPlan(data.result);
                }
            } catch (e) {
                console.error("Failed to fetch action plan:", e);
                setActionPlan({
                    timeframe_1h: "작은 첫 걸음부터 당장 시작하세요.",
                    timeframe_1w: "핵심 마일스톤을 하나 정하고 달성하세요.",
                    mindset_shift: "실행이 전부입니다. 실패는 데이터일 뿐입니다."
                });
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchActionPlan();
    }, [solution]);

    const handleDownloadImage = async () => {
        if (!posterRef.current) return;
        try {
            // Small delay to ensure rendering is complete
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(posterRef.current, {
                scale: 2, // High resolution
                backgroundColor: '#0F1115', // Match background-dark
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = image;
            link.download = `thinksmith-insight-${Date.now()}.png`;

            // Append to body is strictly required for Firefox/Chrome on PC sometimes
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
        } catch (error) {
            console.error("Failed to generate image:", error);
            alert("이미지 저장에 실패했습니다. 데스크탑에서는 브라우저 캐시를 지우고 다시 시도해보세요.");
        }
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen py-10 px-4 md:px-8 flex flex-col items-center overflow-y-auto">

            {/* Downloadable Poster Area */}
            <div
                ref={posterRef}
                className="w-full max-w-md bg-[#111318] rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 pb-8 mb-8"
            >
                {/* Header Strip */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#ff4d00] to-primary animate-pulse opacity-50 mix-blend-overlay"></div>
                    <span className="text-white font-black tracking-tighter text-xl uppercase flex items-center gap-2 relative z-10 drop-shadow-md">
                        <span className="material-symbols-outlined text-2xl text-white">bolt</span>
                        THINKSMITH
                    </span>
                    <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase relative z-10 border border-white/20 px-2 py-0.5 rounded-full">Master Plan</span>
                </div>

                <div className="p-6 space-y-6 opacity-95">
                    {/* Problem -> Truth Flow */}
                    <div className="flex flex-col space-y-4">
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 relative">
                            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Original Problem</h3>
                            <p className="text-slate-300 text-sm leading-relaxed line-through decoration-slate-600">"{problem}"</p>
                            <div className="absolute -bottom-5 left-8 text-primary bg-[#111318] rounded-full p-1 z-10">
                                <span className="material-symbols-outlined text-lg">arrow_downward</span>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 relative mt-2">
                            <h3 className="text-primary/80 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">filter_center_focus</span>
                                Core Truth
                            </h3>
                            <p className="text-primary text-base font-semibold leading-snug">"{coreTruth}"</p>
                        </div>
                    </div>

                    {/* Final Radical Solution Block (Hero) */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 rounded-2xl border border-slate-700 relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-8xl text-primary">rocket</span>
                        </div>
                        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                            <span className="text-primary">▶</span> The Radical Solution
                        </h3>
                        <p className="text-white text-xl font-black leading-snug tracking-wide relative z-10">
                            "{solution}"
                        </p>
                    </div>

                    {/* Immediate Action Plan */}
                    <div className="pt-4 border-t border-white/10">
                        <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                            Execution Plan
                        </h3>

                        {loadingPlan ? (
                            <div className="flex flex-col gap-3 animate-pulse">
                                <div className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                            </div>
                        ) : actionPlan ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-primary font-bold uppercase mb-1">당장 1시간 내로</p>
                                        <p className="text-sm text-slate-200">{actionPlan.timeframe_1h}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="bg-slate-700 border border-slate-600 p-2 rounded-lg text-slate-300">
                                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">이번 주 마일스톤</p>
                                        <p className="text-sm text-slate-200">{actionPlan.timeframe_1w}</p>
                                    </div>
                                </div>
                                {actionPlan.recommended_activity && (
                                    <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="bg-green-500/20 border border-green-500/30 p-2 rounded-lg text-green-400">
                                            <span className="material-symbols-outlined text-sm">directions_run</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-400/80 font-bold uppercase mb-1">추천 활동</p>
                                            <p className="text-sm text-slate-200">{actionPlan.recommended_activity}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary">
                                    <p className="text-[10px] text-primary/80 font-bold uppercase mb-1">실행 마인드셋 (Action Mindset)</p>
                                    <p className="text-sm text-slate-300 font-medium italic">"{actionPlan.mindset_shift}"</p>
                                </div>
                            </div>

                        ) : null}
                    </div>
                </div>
            </div>

            {/* Action Buttons (Outside the screenshot area) */}
            <div className="w-full max-w-md space-y-3 pb-12">
                <button
                    onClick={handleDownloadImage}
                    className="w-full py-4 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    이 실행 계획 폰에 저장하기
                </button>

                {!saveSuccess ? (
                    <button
                        onClick={onSaveToFirebase}
                        disabled={isSaving}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-black tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
                    >
                        {isSaving ? "이메일 창 띄우는 중..." : "나의 다짐 이메일로 내보내기"}
                        <span className="material-symbols-outlined">mail</span>
                    </button>
                ) : (
                    <div className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">mark_email_read</span>
                        이메일 앱이 열렸습니다. 전송을 완료하세요!
                    </div>
                )}

                <button
                    onClick={onRestart}
                    className="w-full py-4 rounded-xl text-slate-500 text-sm font-medium border border-transparent hover:border-white/10 hover:text-white transition-all mt-6 shadow-none"
                >
                    <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">replay</span>
                        다른 문제도 박살내러 가기
                    </span>
                </button>
            </div>

        </div>
    );
}
