import { createClient } from '../../lib/supabase/server'
import { getUser } from '../../lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '../../lib/utils'
import { StudentHeader } from '../../components/student/StudentHeader'
import { BookOpen, Play } from 'lucide-react'

export default async function MyCoursesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(id, title, cover_image_url, total_lessons, total_modules, price)')
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Meus Cursos</h1>
          <p className="text-gray-500 mt-1">{enrollments?.length || 0} curso(s) adquirido(s)</p>
        </div>
        {!enrollments || enrollments.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border bg-white shadow-sm">
            <div className="text-5xl mb-4">🔮</div>
            <p className="text-gray-500 mb-4">Você ainda não tem cursos.</p>
            <Link href="/catalog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl mystic-gradient text-white font-medium hover:opacity-90">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(enrollments as any[]).map(e => {
              const c = e.course
              if (!c) return null
              return (
                <div key={e.id} className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-mystic-100 overflow-hidden">
                    {c.cover_image_url
                      ? <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🔮</div>}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{c.title}</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progresso</span><span>{Math.round(e.progress_percent || 0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-mystic-500 transition-all" style={{ width: `${e.progress_percent || 0}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen size={10} />{c.total_lessons} aulas</span>
                      <span>Desde {formatDate(e.enrolled_at)}</span>
                    </div>
                    <Link href={`/course/${c.id}`}
                      className="flex items-center justify-center gap-2 w-full h-9 rounded-lg mystic-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Play size={11} fill="currentColor" /> Continuar
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
