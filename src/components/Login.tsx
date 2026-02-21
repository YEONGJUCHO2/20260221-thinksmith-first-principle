"use client";
import React from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface LoginProps {
    onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

    React.useEffect(() => {
        if (user) {
            onLoginSuccess();
        }
    }, [user, onLoginSuccess]);

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col justify-center items-center overflow-hidden relative">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background-dark">
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary flex items-center justify-center ember-glow mb-6">
                    <span className="material-symbols-outlined text-background-dark font-bold text-4xl">skillet</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Thinksmith</h1>
                <p className="text-primary/80 text-sm font-medium tracking-widest uppercase">제1원칙으로 생각하기</p>
            </div>

            <div className="z-10 w-full max-w-sm px-6">
                <button
                    onClick={() => signInWithGoogle()}
                    disabled={loading}
                    className="w-full h-14 forge-gradient ember-glow rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-background-dark font-bold disabled:opacity-50"
                >
                    {loading ? "로딩중..." : "Google로 시작하기"}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 text-center">로그인 실패: {error.message}</p>}
            </div>
        </div>
    );
}
