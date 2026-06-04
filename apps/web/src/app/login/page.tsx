'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'signin' | 'signup' | null>(null)

  async function handleAuth(mode: 'signin' | 'signup') {
    setLoading(mode)
    setError(null)
    const supabase = createClient()
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setLoading(null)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070710] px-4 text-zinc-100">
      <style>{`
        @keyframes tfDrift1 { 0%,100%{transform:translate(-10%,-10%) scale(1)} 50%{transform:translate(10%,10%) scale(1.15)} }
        @keyframes tfDrift2 { 0%,100%{transform:translate(10%,0) scale(1.1)} 50%{transform:translate(-10%,12%) scale(.95)} }
        @keyframes tfFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tfScan { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.3);opacity:0} }
        @keyframes tfFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes tfShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .tf-blob1{animation:tfDrift1 16s ease-in-out infinite}
        .tf-blob2{animation:tfDrift2 20s ease-in-out infinite}
        .tf-fade{animation:tfFadeUp .7s cubic-bezier(.2,.7,.2,1) both}
        .tf-fade-2{animation:tfFadeUp .7s .12s cubic-bezier(.2,.7,.2,1) both}
        .tf-scan{animation:tfScan 2.6s ease-out infinite}
        .tf-scan-2{animation:tfScan 2.6s 1.3s ease-out infinite}
        .tf-float{animation:tfFloat 5s ease-in-out infinite}
        .tf-btn{background:linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1);background-size:200% 100%;animation:tfShimmer 6s linear infinite}
        @media (prefers-reduced-motion: reduce){.tf-blob1,.tf-blob2,.tf-fade,.tf-fade-2,.tf-scan,.tf-scan-2,.tf-float,.tf-btn{animation:none}}
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="tf-blob1 absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-[110px]" />
        <div className="tf-blob2 absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-violet-600/20 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="tf-fade mb-8 flex flex-col items-center text-center">
          <div className="tf-float relative mb-5">
            <span className="tf-scan absolute inset-0 rounded-2xl border border-indigo-400/40" />
            <span className="tf-scan-2 absolute inset-0 rounded-2xl border border-indigo-400/40" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-600/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">TrueFace</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Spot edited &amp; AI-altered photos in seconds.</p>
        </div>

        <div className="tf-fade-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
                {error}
              </p>
            )}

            <button
              onClick={() => handleAuth('signin')}
              disabled={loading !== null}
              className="tf-btn w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {loading === 'signin' ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              onClick={() => handleAuth('signup')}
              disabled={loading !== null}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              {loading === 'signup' ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </div>

        <p className="tf-fade-2 mt-6 text-center text-xs text-zinc-600">
          Authenticity estimates only — never definitive proof.
        </p>
      </div>
    </main>
  )
}
