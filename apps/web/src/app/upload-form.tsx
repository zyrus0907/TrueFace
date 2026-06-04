'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DETECTOR_URL = process.env.NEXT_PUBLIC_DETECTOR_URL ?? 'http://localhost:8000'

type Signal = { name: string; detail: string; suspicion: number; experimental?: boolean }
type Result = { authenticity_score: number; signals: Signal[]; disclaimer: string }

function verdict(score: number) {
  if (score >= 75) return { label: 'Likely authentic', color: '#16a34a', track: '#bbf7d0' }
  if (score >= 50) return { label: 'Some signs of editing', color: '#d97706', track: '#fde68a' }
  return { label: 'Likely edited', color: '#dc2626', track: '#fecaca' }
}

function signalColor(s: number) {
  if (s >= 0.5) return '#dc2626'
  if (s >= 0.25) return '#d97706'
  return '#16a34a'
}

function prettyName(name: string) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  function onPick(f: File | null) {
    setFile(f)
    setResult(null)
    setStatus(null)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleUpload() {
    if (!file) return
    setBusy(true)
    setResult(null)
    setStatus('Uploading…')
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setStatus('Not signed in.')
      setBusy(false)
      return
    }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file)
    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`)
      setBusy(false)
      return
    }

    const { data: row, error: insertError } = await supabase
      .from('analyses')
      .insert({ user_id: user.id, image_path: path, status: 'pending' })
      .select()
      .single()
    if (insertError) {
      setStatus(`DB insert failed: ${insertError.message}`)
      setBusy(false)
      return
    }

    setStatus('Analyzing…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${DETECTOR_URL}/analyze`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Detector returned ${res.status}`)
      const data: Result = await res.json()

      await supabase
        .from('analyses')
        .update({
          status: 'done',
          authenticity_score: data.authenticity_score,
          signals: data.signals,
        })
        .eq('id', row.id)

      setResult(data)
      setStatus(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setStatus(`Analysis failed: ${msg}. Is the detector running on :8000?`)
    }
    setBusy(false)
  }

  const v = result ? verdict(result.authenticity_score) : null
  const R = 54
  const C = 2 * Math.PI * R

  return (
    <div className="w-full max-w-md space-y-5">
      <label className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="h-full w-full object-contain" />
        ) : (
          <div className="text-center text-sm text-zinc-500">
            <p className="font-medium">Click to choose an image</p>
            <p className="text-xs">JPG or PNG</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || busy}
        className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {busy ? status ?? 'Working…' : 'Analyze image'}
      </button>

      {status && !busy && <p className="text-sm text-red-600">{status}</p>}

      {result && v && (
        <div className="space-y-5 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
                <circle cx="64" cy="64" r={R} fill="none" stroke={v.track} strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke={v.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - result.authenticity_score / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{result.authenticity_score}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: v.color }}>
                {v.label}
              </p>
              <p className="text-sm text-zinc-500">Authenticity estimate</p>
            </div>
          </div>

          <div className="space-y-3">
            {result.signals.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {prettyName(s.name)}
                    {s.experimental && (
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-zinc-500 dark:bg-zinc-800">
                        experimental
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-500">{Math.round(s.suspicion * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.suspicion * 100}%`,
                      background: s.experimental ? '#a1a1aa' : signalColor(s.suspicion),
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500">{s.detail}</p>
              </div>
            ))}
          </div>

          <p className="border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
