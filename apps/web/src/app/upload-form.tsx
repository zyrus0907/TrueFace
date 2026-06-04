'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setStatus(null)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setStatus('Not signed in.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file)
    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('analyses')
      .insert({ user_id: user.id, image_path: path, status: 'pending' })
    if (insertError) {
      setStatus(`File saved but DB insert failed: ${insertError.message}`)
      setUploading(false)
      return
    }

    setStatus('Uploaded — analysis queued.')
    setUploading(false)
    setFile(null)
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Upload image'}
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  )
}
