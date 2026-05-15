import { getSellerCourses } from '../../../lib/actions/courses'
import { formatCurrency } from '../../../lib/utils'
import Link from 'next/link'
import { Plus, BookOpen, Pencil, Eye } from 'lucide-react'

export default async function CoursesPage() {
  const courses = await getSellerCourses()
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Meus Cursos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{courses.length} curso(s)</p>
        </div>
        <Link href="/dashboard/courses/new" className="flex items-center gap-2 px-4 py-2 rounded-lg mystic-gradient text-white text-sm font-medium hover:opacity-90 shadow-sm">
          <Plus size={15} /> Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🔮</div>
          <h3 className="text-lg font-semibold mb-2">Nenhum curso ainda</h3>
          <p className="text-gray-500 text-sm mb-6">Crie seu primeiro curso de Tarot!</p>
          <Link href="/dashboard/courses/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl mystic-gradient text-white font-medium hover:opacity-90">
            <Plus size={15} /> Criar primeiro curso
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:border-mystic-200 transition-colors group shadow-sm">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-mystic-100 shrink-0">
                {c.cover_image_url ? <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🔮</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold truncate text-sm">{c.title}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                  {c.price === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500 text-white shrink-0">GRÁTIS</span>}
                </div>
                <p className="text-xs text-gray-400">{c.total_lessons} aulas · {c.total_modules} módulos · {c.price > 0 ? formatCurrency(c.price) : 'Gratuito'}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {c.is_published && (
                  <Link href={`/course/${c.id}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50">
                    <Eye size={12} /> Ver
                  </Link>
                )}
                <Link href={`/dashboard/courses/edit?id=${c.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mystic-50 text-mystic-700 text-xs font-medium hover:bg-mystic-100">
                  <Pencil size={12} /> Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
