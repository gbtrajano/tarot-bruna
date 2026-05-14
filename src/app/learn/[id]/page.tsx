import { createClient } from '../../../lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '../../../lib/actions/auth'
import { MarkCompleteButton } from '../../../components/student/MarkCompleteButton'
import { Play, Lock, CheckCircle, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const { data: lesson } = await supabase.from('lessons').select('*, course:courses(*)').eq('id', id).single()
  if (!lesson) notFound()

  const { data: enrollment } = await supabase.from('enrollments').select('*').eq('student_id', user.id).eq('course_id', lesson.course_id).single()
  const canWatch = !!enrollment || lesson.is_preview
  if (!canWatch) redirect(`/course/${lesson.course_id}`)

  const { data: modules } = await supabase.from('modules').select('*, lessons(*)').eq('course_id', lesson.course_id).order('order_index', { ascending: true })

  let completed: string[] = []
  if (enrollment) {
    const { data: prog } = await supabase.from('lesson_progress').select('lesson_id').eq('enrollment_id', enrollment.id).eq('completed', true)
    completed = prog?.map((p: any) => p.lesson_id) || []
    await supabase.from('lesson_progress').upsert(
      { enrollment_id: enrollment.id, lesson_id: id, student_id: user.id, completed: false },
      { onConflict: 'enrollment_id,lesson_id' }
    )
  }

  const course = lesson.course as any
  const totalLessons = (modules || []).reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0)
  const progressPct = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0

  return (
    <div className="flex flex-col h-screen bg-mystic-950">
      <header className="h-14 flex items-center justify-between px-4 bg-mystic-950 border-b border-mystic-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/course/${lesson.course_id}`} className="text-mystic-400 hover:text-white transition-colors p-1">
            <ArrowLeft size={16} />
          </Link>
          <span className="text-white font-display font-semibold text-sm truncate max-w-xs lg:max-w-sm">{course?.title}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-mystic-400 text-xs">
          <div className="w-24 h-1.5 rounded-full bg-mystic-800 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span>{progressPct}%</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="bg-black w-full">
            {lesson.video_url && canWatch ? (
              <video src={lesson.video_url} controls className="w-full max-h-[65vh] block">
                Seu navegador não suporta o player de vídeo.
              </video>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-4 text-center px-4">
                {canWatch
                  ? <p className="text-white/50 text-sm">Vídeo não disponível ainda.</p>
                  : <>
                    <Lock size={40} className="text-white/30" />
                    <p className="text-white/60 text-sm">Adquira o curso para assistir esta aula</p>
                    <Link href={`/checkout/${lesson.course_id}`}
                      className="px-5 py-2.5 rounded-xl mystic-gradient text-white text-sm font-semibold hover:opacity-90">
                      Comprar curso
                    </Link>
                  </>
                }
              </div>
            )}
          </div>

          <div className="p-6 max-w-3xl">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-display font-bold text-white">{lesson.title}</h1>
              {enrollment && (
                <MarkCompleteButton
                  lessonId={id}
                  enrollmentId={enrollment.id}
                  studentId={user.id}
                  courseId={lesson.course_id}
                  isCompleted={completed.includes(id)}
                />
              )}
            </div>
            {lesson.description && (
              <p className="text-mystic-300 text-sm leading-relaxed">{lesson.description}</p>
            )}
            {lesson.material_url && (
              <a href={lesson.material_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-mystic-800 text-white text-sm hover:bg-mystic-700 transition-colors">
                <BookOpen size={14} /> Baixar material complementar
              </a>
            )}
          </div>
        </main>

        <aside className="w-80 bg-mystic-900 border-l border-mystic-800 overflow-y-auto shrink-0 hidden lg:block">
          <div className="p-4 border-b border-mystic-800">
            <p className="text-xs font-semibold text-mystic-400 uppercase tracking-wider">Conteúdo do curso</p>
          </div>
          {(modules || []).map((mod: any, mIdx: number) => (
            <div key={mod.id}>
              <div className="px-4 py-2.5 bg-mystic-800/60">
                <p className="text-xs font-semibold text-mystic-300">{mIdx + 1}. {mod.title}</p>
              </div>
              {(mod.lessons || []).map((l: any, lIdx: number) => {
                const isActive = l.id === id
                const isDone = completed.includes(l.id)
                const isLocked = !enrollment && !l.is_preview
                return (
                  <Link key={l.id}
                    href={isLocked ? `/course/${lesson.course_id}` : `/learn/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${isActive ? 'bg-mystic-600 text-white' : 'text-mystic-300 hover:bg-mystic-800 hover:text-white'} ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : isActive ? 'bg-white/20' : 'bg-mystic-700'}`}>
                      {isLocked ? <Lock size={8} /> : isDone ? <CheckCircle size={10} className="text-white" /> : isActive ? <Play size={8} fill="currentColor" /> : <span className="text-[9px] font-bold">{lIdx + 1}</span>}
                    </div>
                    <span className="truncate flex-1">{l.title}</span>
                    {isActive && <ChevronRight size={12} className="shrink-0" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
