"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import Login from "@/components/Login";
import Step1 from "@/components/Step1";
import Step3 from "@/components/Step3";
import ResultPoster from "@/components/ResultPoster";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState("");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [coreTruth, setCoreTruth] = useState("");
  const [solution, setSolution] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [examples, setExamples] = useState<string[]>([
    "회의가 너무 많다",
    "연봉을 올리고 싶다",
    "퇴근 후 시간이 없다"
  ]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    setLoadingExamples(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "generate_examples" })
      });
      const data = await res.json();
      if (data.result && Array.isArray(data.result)) {
        setExamples(data.result);
      }
    } catch (e) {
      console.error("AI Example generation error", e);
    } finally {
      setLoadingExamples(false);
    }
  };

  const handleFinish = (finalSolution: string) => {
    setSolution(finalSolution);
    setStep(4);
  };

  const saveToFirebase = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "first_principles"), {
        userId: user.uid,
        problem,
        assumptions,
        coreTruth,
        solution,
        createdAt: serverTimestamp(),
      });
      setSaveSuccess(true);
    } catch (e: any) {
      console.error("Firestore Save Error:", e);
      alert(`저장 실패: ${e.message}\nFirebase 설정을 확인해주세요.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setProblem("");
    setAssumptions([]);
    setCoreTruth("");
    setSolution("");
    setSaveSuccess(false);
    setShowLogin(false);
  };

  if (showLogin && !user) {
    return (
      <div className="relative min-h-screen bg-background-dark">
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => setShowLogin(false)} className="text-slate-400 p-2 glass-morphism rounded-full hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <Login onLoginSuccess={() => {
          setShowLogin(false);
          // If we are at Step 4, we likely wanted to save immediately
          if (step === 4) saveToFirebase();
        }} />
      </div>
    );
  }

  // Switch routing based on steps
  if (step === 1) return <Step1 problem={problem} onNext={(truth) => { setCoreTruth(truth); setStep(3); }} onBack={() => setStep(0)} />;
  if (step === 3) return <Step3 coreTruth={coreTruth} onNext={handleFinish} onBack={() => setStep(1)} onHome={() => setStep(0)} />;

  // ====== STEP 4 (Result & Save Option) =====
  if (step === 4) {
    return (
      <ResultPoster
        problem={problem}
        coreTruth={coreTruth}
        solution={solution}
        onSaveToFirebase={saveToFirebase}
        onRestart={handleRestart}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
      />
    );
  }

  // ====== STEP 0 (Problem Input) =====
  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-96 bg-glow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-[#ff4d00]/5 rounded-full blur-[80px]"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center ember-glow">
            <span className="material-symbols-outlined text-background-dark font-bold text-xl">gavel</span>
          </div>
          <div>
            <h2 className="text-slate-100 font-bold text-sm tracking-tight">THINKSMITH</h2>
            <p className="text-primary/70 text-[10px] font-medium tracking-widest uppercase">제1원칙으로 생각하기</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <div className="text-[10px] text-primary flex items-center gap-1 font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Connected
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-xs font-bold text-slate-400 hover:text-white underline-offset-4 hover:underline transition-all"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 px-6 pt-8 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-bold leading-tight text-slate-100">
            어떤 문제를<br />
            <span className="text-primary">해결</span>하고 싶으세요?
          </h1>
          <p className="text-slate-400 mt-3 text-sm font-medium">로그인 없이 바로 생각의 도가니를 시작하세요.</p>
        </div>

        <div className="relative group flex-1 flex flex-col min-h-[220px]">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-orange-600/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative flex-1 glass-morphism rounded-xl overflow-hidden focus-within:border-primary">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full h-full bg-transparent border-none text-slate-100 placeholder:text-slate-600 p-5 focus:ring-0 focus:outline-none text-lg resize-none leading-relaxed"
              placeholder="해결하고 싶은 문제를 입력하세요..."
            ></textarea>
            <div className="absolute bottom-3 right-4 flex items-center gap-2 text-slate-500 text-[10px] font-mono tracking-tighter uppercase pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-50"></span>
              Forge Ready
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-slate-800"></span>
              실험해볼 예시들
            </p>
            <button
              onClick={loadExamples}
              disabled={loadingExamples}
              className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[14px] ${loadingExamples ? 'animate-spin' : ''}`}>refresh</span>
              {loadingExamples ? "생각 중..." : "AI 제안"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {loadingExamples ? (
              <div className="w-full h-10 rounded-lg bg-slate-800/40 animate-pulse"></div>
            ) : (
              examples.map((example) => (
                <button
                  key={example}
                  onClick={() => setProblem(example)}
                  className="px-4 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 text-xs font-medium hover:border-primary/50 transition-colors"
                >
                  {example}
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      <div className="relative z-10 px-6 pb-10 pt-6">
        <button
          className="w-full h-14 forge-gradient rounded-xl flex items-center justify-center gap-2 text-background-dark font-bold text-lg ember-glow hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          disabled={!problem.trim()}
          onClick={() => setStep(1)}
        >
          시작하기
          <span className="material-symbols-outlined font-bold">local_fire_department</span>
        </button>
      </div>
    </div>
  );
}
