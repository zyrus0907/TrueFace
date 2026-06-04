'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DETECTOR_URL = 'http://localhost:8000'

type Signal = { name: string; detail: string; suspicion: number }
type Result = { authenticity_score: number; signals: Signal[]; disclaimer: string }

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

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

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file)
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
    setFile(null)
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={!file || busy}
        className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {busy ? 'Working…' : 'Analyze image'}
      </button>
      {status && <p className="text-sm">{status}</p>}
      {result && (
        <div className="rounded border p-4 space-y-2">
          <p className="text-lg font-semibold">
            Authenticity: {result.authenticity_score}/100
          </p>
          <ul className="space-y-1 text-sm">
            {result.signals.map((s) => (
              <li key={s.name}>• {s.detail} (suspicion {s.suspicion})</li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500">{result.disclaimer}</p>
        </div>
      )}
    </div>
  )
}
