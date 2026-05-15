import { getCourseWithModules } from '../../../lib/actions/courses'
import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import { StudentHeader } from '../../../components/student/StudentHeader'
import { formatCurrency, formatDuration } from '../../../lib/utils'
import { Lock, Play, Clock, BookOpen, CheckCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { course, modules } = await getCourseWithModules(id)
  if (!course || !course.is_published) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isEnrolled = false
  if (user) {
    const { data } = await supabase.from('enrollments').select('id').eq('student_id', user.id).eq('course_id', id).single()
    isEnrolled = !!data
  }

  const totalLessons = modules.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0)
  const firstLesson = modules[0]?.lessons?.[0]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #2d0a0a, #4a1515, #f9fafb)' }}>
      <StudentHeader />
      <section className="pt-20 pb-0">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            {course.category && <span className="text-xs font-semibold uppercase tracking-widest text-yellow-400">{course.category.replace(/-/g, ' ')}</span>}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">{course.title}</h1>
            {course.short_description && <p className="text-mystic-200 text-lg">{course.short_description}</p>}
            <div className="flex items-center gap-4 text-sm text-mystic-300">
              <span className="flex items-center gap-1.5"><BookOpen size={14} />{totalLessons} aulas</span>
              {course.total_duration_minutes > 0 && <span className="flex items-center gap-1.5"><Clock size={14} />{formatDuration(course.total_duration_minutes)}</span>}
            </div>
          </div>
          {/* Card de compra */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden sticky top-20">
              {course.cover_image_url && <img src={course.cover_image_url} alt={course.title} className="w-full aspect-video object-cover" />}
              <div className="p-6 space-y-4">
                <div className="text-3xl font-bold font-display text-gray-900">
                  {course.price === 0 ? <span className="text-emerald-600">Gratuito</span> : formatCurrency(course.price)}
                </div>
                {isEnrolled ? (
                  <Link href={firstLesson ? `/learn/${firstLesson.id}` : '/catalog'}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl mystic-gradient text-white font-semibold hover:opacity-90 transition-opacity">
                    <Play size={15} fill="currentColor" /> Continuar estudando
                  </Link>
                ) : (
                  <Link href={`/checkout/${id}`}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl mystic-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-lg">
                    {course.price === 0 ? '🎓 Inscrever-se grátis' : `Comprar — ${formatCurrency(course.price)}`}
                  </Link>
                )}
                <ul className="space-y-2">
                  {['Acesso vitalício', 'Assista no celular ou PC', 'Certificado de conclusão', 'Material de apoio'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {course.what_you_learn?.length > 0 && (
            <div>
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-4">O que você vai aprender</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.what_you_learn.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-mystic-500 mt-0.5 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          )}
          {course.description && (
            <div>
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-3">Sobre o curso</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{course.description}</p>
            </div>
          )}
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-900 mb-4">
              Conteúdo do curso <span className="text-sm font-normal text-gray-400">({modules.length} módulos · {totalLessons} aulas)</span>
            </h2>
            <div className="space-y-2">
              {modules.map((mod: any, mIdx: number) => (
                <details key={mod.id} className="group border rounded-xl overflow-hidden" open={mIdx === 0}>
                  <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 list-none">
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-gray-400" />
                    <span className="font-medium text-sm flex-1">{mod.title}</span>
                    <span className="text-xs text-gray-400">{mod.lessons?.length || 0} aulas</span>
                  </summary>
                  <div className="border-t divide-y">
                    {(mod.lessons || []).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${lesson.is_preview || isEnrolled ? 'bg-mystic-100 text-mystic-600' : 'bg-gray-100 text-gray-400'}`}>
                          {lesson.is_preview || isEnrolled ? <Play size={10} fill="currentColor" /> : <Lock size={10} />}
                        </div>
                        <p className="text-sm flex-1 truncate">{lesson.title}</p>
                        {lesson.is_preview && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">PREVIEW</span>}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
