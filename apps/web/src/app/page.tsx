import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadForm from './upload-form'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <span className="text-lg font-bold tracking-tight">TrueFace</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/history" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            History
          </Link>
          <span className="text-zinc-500">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Check an image</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload a photo to estimate how likely it is to be unedited.
          </p>
        </div>
        <UploadForm />
      </main>
    </div>
  )
}
