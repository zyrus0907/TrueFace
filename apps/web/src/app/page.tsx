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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Welcome to TrueFace</h1>
      <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
      <UploadForm />
      <form action="/auth/signout" method="post">
        <button className="rounded border px-3 py-2">Sign out</button>
      </form>
    </main>
  )
}
