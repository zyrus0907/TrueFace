import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Welcome to TrueFace</h1>
      <p>Signed in as {user.email}</p>
      <form action="/auth/signout" method="post">
        <button className="rounded border px-3 py-2">Sign out</button>
      </form>
    </main>
  )
}
