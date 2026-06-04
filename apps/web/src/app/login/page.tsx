'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FEATURES = [
  'Metadata & EXIF inspection',
  'Error-level analysis (ELA)',
  'AI-generation screening',
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="grid min-h-screen bg-white text-zinc-900 lg:grid-cols-2">
      <style>{`
        @keyframes tfDrift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(6%,-6%) scale(1.12)} }
        @keyframes tfUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .tf-drift{animation:tfDrift 18s ease-in-out infinite}
        .tf-up{animation:tfUp .7s cubic-bezier(.2,.7,.2,1) both}
        .tf-up-1{animation:tfUp .7s .1s cubic-bezier(.2,.7,.2,1) both}
        .tf-up-2{animation:tfUp .7s .2s cubic-bezier(.2,.7,.2,1) both}
        @media (prefers-reduced-motion: reduce){.tf-drift,.tf-up,.tf-up-1,.tf-up-2{animation:none}}
      `}</style>

      {/* Left — editorial brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="tf-drift absolute -left-20 top-10 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="tf-drift absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" style={{ animationDelay: '-9s' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '46px 46px' }} />
        </div>

        <div className="tf-up relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">TrueFace</span>
        </div>

        <div className="tf-up-1 relative max-w-md">
          <h1 className="text-[2.6rem] font-semibold leading-[1.1] tracking-tight">Know what&apos;s real.</h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-400">
            Forensic image analysis that flags editing, manipulation, and AI generation — with reasons you can actually verify.
          </p>
        </div>

        <ul className="tf-up-2 relative space-y-3.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Right — auth form */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="tf-up w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">TrueFace</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            {mode === 'signin' ? 'Sign in to analyze your images.' : 'Start checking images in seconds.'}
          </p>

          <div className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
              className="font-medium text-indigo-600 transition hover:text-indigo-700"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <p className="mt-10 text-center text-xs text-zinc-400">
            Authenticity estimates only — never definitive proof.
          </p>
        </div>
      </section>
    </main>
  )
}
