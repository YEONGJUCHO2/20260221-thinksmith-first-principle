import React, { useState, useEffect, useRef } from 'react';
import ForgeLoader from '@/components/ForgeLoader';

interface Step1Props {
    problem: string;
    onNext: (coreTruth: string) => void;
    onBack: () => void;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

interface SuggestionOption {
    text: string;
    reason: string;
}

export default function Step1({ problem, onNext, onBack }: Step1Props) {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentOptions, setCurrentOptions] = useState<SuggestionOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, currentOptions, loading]);

    // Initial fetch
    useEffect(() => {
        analyzeRootCause([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const analyzeRootCause = async (history: ChatMessage[]) => {
        setLoading(true);
        setCurrentOptions([]);
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "analyze_root_cause", payload: { problem, chatHistory: history } })
            });
            const data = await res.json();

            if (data.result) {
                const isConcluded = data.result.isRootCauseFound === true || data.result.isRootCauseFound === "true" || history.length >= 10;

                if (isConcluded) {
                    // Try to find the exact key, or fall back to any reasonable string value Gemini might have returned
                    let fallbackTruth = data.result.coreTruth || data.result.rootCause || data.result.nextQuestion;
                    if (!fallbackTruth) {
                        const possibleTruth = Object.values(data.result).find(v => typeof v === 'string' && v.length > 15 && v.length < 300);
                        fallbackTruth = possibleTruth || "더 이상 쪼갤 수 없는 근원적 갈망/원인에 도달했습니다.";
                    }
                    onNext(fallbackTruth as string);
                } else if (data.result.nextQuestion) {
                    setChatHistory(prev => [...prev, { role: 'ai', content: data.result.nextQuestion }]);
                    if (data.result.options && Array.isArray(data.result.options)) {
                        setCurrentOptions(data.result.options);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to analyze root cause", e);
            setChatHistory(prev => [...prev, { role: 'ai', content: "(네트워크 오류) 진단을 이어갈 수 없습니다." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserResponse = async (text: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: text }];
        setChatHistory(newHistory);
        await analyzeRootCause(newHistory);
    };

    const handleCustomSubmit = async () => {
        if (!customInput.trim() || loading) return;
        const text = customInput.trim();
        setCustomInput("");
        await handleUserResponse(text);
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
            <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-white/5 px-4 pt-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} title="이전 (초기 화면)" className="text-slate-400 p-2 -ml-2 text-xl hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col flex-1 items-center text-center">
                        <h1 className="text-white text-sm font-medium tracking-wide flex items-center justify-center gap-1 uppercase opacity-80">
                            <span className="material-symbols-outlined text-primary text-base">psychology</span>
                            1단계: 심층 진단
                        </h1>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">"{problem}"</p>
                    </div>
                    <button onClick={onBack} title="처음으로" className="text-slate-400 p-2 -mr-2 text-xl hover:text-white transition-colors">
                        <span className="material-symbols-outlined">home</span>
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        <span>Phase 1: Root Cause Analysis</span>
                        <span className="text-primary animate-pulse">Analyzing...</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 w-full animate-pulse shadow-[0_0_8px_rgba(244,106,37,0.5)]"></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-8 pb-40 space-y-6 flex flex-col bg-gradient-to-b from-background-dark via-forge-deep to-background-dark">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`max-w-[90%] rounded-2xl p-4 shadow-md ${msg.role === 'ai' ? 'self-start bg-slate-800/80 border border-white/5' : 'self-end bg-primary/10 text-white border border-primary/20'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'ai' && (
                            <h3 className="text-primary/80 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">filter_center_focus</span>
                                AI 코치
                            </h3>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                ))}

                {loading && (
                    <div className="self-center mt-4 w-full flex justify-center">
                        <ForgeLoader text="답변을 분석 중입니다..." />
                    </div>
                )}

                {!loading && currentOptions.length > 0 && (
                    <div className="flex flex-col gap-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-4 h-px bg-slate-600"></span>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">가장 공감되는 당신의 답변을 고르세요:</p>
                        </div>
                        {currentOptions.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleUserResponse(opt.text)}
                                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left flex flex-col gap-2 relative overflow-hidden group active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <span className="text-slate-100 font-medium text-sm leading-snug relative z-10 transition-colors group-hover:text-white shrink-0">"{opt.text}"</span>
                                {opt.reason && (
                                    <div className="flex gap-1.5 items-start mt-1 relative z-10">
                                        <span className="material-symbols-outlined text-[12px] text-primary/60 mt-[2px]">lightbulb</span>
                                        <p className="text-[11px] text-slate-400 font-light leading-snug">
                                            {opt.reason}
                                        </p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </main>

            {/* Input area */}
            <div className="fixed bottom-0 left-0 w-full bg-background-dark/95 backdrop-blur-xl border-t border-white/10 p-4 pb-6 z-40">
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                        placeholder={loading ? "기다려주세요..." : "직접 답변을 입력할 수도 있습니다..."}
                        disabled={loading}
                        className="w-full bg-[#111318] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 pr-14 shadow-inner"
                    />
                    <button
                        onClick={handleCustomSubmit}
                        disabled={!customInput.trim() || loading}
                        className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-[#ff4d00] disabled:bg-slate-700/50 disabled:text-slate-500 text-white w-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
