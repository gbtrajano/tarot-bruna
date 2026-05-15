import { createClient } from '../../../lib/supabase/server'
import { getUser } from '../../../lib/actions/auth'
import { getSellerCourses } from '../../../lib/actions/courses'
import { formatDate } from '../../../lib/utils'
import { Users, GraduationCap } from 'lucide-react'

export default async function StudentsPage() {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return null

  const courses = await getSellerCourses()
  const courseIds = courses.map((c: any) => c.id)

  let enrollments: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from('enrollments')
      .select('*, student:profiles(full_name, email), course:courses(title, cover_image_url)')
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false })
    enrollments = data || []
  }

  const uniqueStudents = new Set(enrollments.map(e => e.student_id)).size

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-display font-bold">Alunos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{uniqueStudents} aluno(s) matriculado(s)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Alunos únicos', value: uniqueStudents, icon: Users, color: 'bg-mystic-100 text-mystic-700' },
          { label: 'Matrículas totais', value: enrollments.length, icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
          { label: 'Cursos', value: courses.length, icon: null, emoji: '📚', color: 'bg-emerald-100 text-emerald-700' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border bg-white p-5 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
              {card.icon ? <card.icon size={18} /> : <span className="text-lg">{card.emoji}</span>}
            </div>
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-sm">Todas as matrículas</h2>
        </div>
        {enrollments.length === 0 ? (
          <div className="py-16 text-center">
            <GraduationCap size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Nenhum aluno matriculado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Aluno', 'Curso', 'Progresso', 'Matriculado em'].map(h => (
                    <th key={h} className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-mystic-100 flex items-center justify-center text-sm font-semibold text-mystic-700 shrink-0">
                          {e.student?.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{e.student?.full_name || 'Aluno'}</p>
                          <p className="text-xs text-gray-400">{e.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 max-w-[180px] truncate">{e.course?.title}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-mystic-500" style={{ width: `${e.progress_percent || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(e.progress_percent || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">{formatDate(e.enrolled_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
