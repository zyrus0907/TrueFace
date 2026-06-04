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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 text-zinc-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">TrueFace</h1>
          <p className="mt-1 text-sm text-zinc-400">Check whether an image has been edited.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={() => handleAuth('signin')}
              disabled={loading !== null}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading === 'signin' ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              onClick={() => handleAuth('signup')}
              disabled={loading !== null}
              className="w-full rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading === 'signup' ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Authenticity estimates only — not definitive proof.
        </p>
      </div>
    </main>
  )
}
