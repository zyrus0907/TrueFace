import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function verdictColor(score: number | null) {
  if (score == null) return '#a1a1aa'
  if (score >= 75) return '#16a34a'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

export default async function History() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, image_path, status, authenticity_score, created_at')
    .order('created_at', { ascending: false })

  const items = await Promise.all(
    (analyses ?? []).map(async (a) => {
      const { data } = await supabase.storage
        .from('uploads')
        .createSignedUrl(a.image_path, 3600)
      return { ...a, url: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <span className="text-lg font-bold tracking-tight">TrueFace</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Analyze
          </Link>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold">Your analyses</h1>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No analyses yet.{' '}
            <Link href="/" className="underline">
              Analyze an image
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                  {a.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-500">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs capitalize text-zinc-400">{a.status}</p>
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: verdictColor(a.authenticity_score) }}
                >
                  {a.authenticity_score ?? '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
