import { getDashboardStats } from '../../lib/actions/dashboard'
import { getSellerCourses } from '../../lib/actions/courses'
import { formatCurrency, formatDate } from '../../lib/utils'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { Users, BookOpen, DollarSign, GraduationCap, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const [stats, courses] = await Promise.all([getDashboardStats(), getSellerCourses()])

  const cards = [
    { label: 'Matrículas', value: String(stats?.total_enrollments ?? 0), sub: `+${stats?.new_enrollments_this_month ?? 0} este mês`, icon: GraduationCap, color: 'bg-mystic-100 text-mystic-700' },
    { label: 'Alunos', value: String(stats?.total_students ?? 0), sub: 'alunos únicos', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Receita total', value: formatCurrency(stats?.total_revenue ?? 0), sub: `${formatCurrency(stats?.revenue_this_month ?? 0)} este mês`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Cursos', value: `${stats?.total_published ?? 0}/${stats?.total_courses ?? 0}`, sub: 'publicados / total', icon: BookOpen, color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Visão geral da sua escola de Tarot</p>
        </div>
        <Link href="/dashboard/courses/new" className="flex items-center gap-2 px-4 py-2 rounded-lg mystic-gradient text-white text-sm font-medium hover:opacity-90 shadow-sm">
          <Plus size={15} /> Novo Curso
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}><c.icon size={18} /></div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-4">Receita por mês</h2>
          <RevenueChart data={stats?.revenue_by_month || []} />
        </div>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b"><h2 className="font-semibold text-sm">Últimas vendas</h2></div>
          {(stats?.recent_orders || []).length === 0
            ? <p className="px-5 py-8 text-sm text-gray-400 text-center">Nenhuma venda ainda.</p>
            : (stats?.recent_orders || []).map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 border-b last:border-0">
                <div className="w-7 h-7 rounded-full bg-mystic-100 flex items-center justify-center text-xs font-semibold text-mystic-700 shrink-0">
                  {o.student?.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{o.student?.full_name || 'Aluno'}</p>
                  <p className="text-xs text-gray-400 truncate">{o.course?.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-emerald-600">{formatCurrency(o.amount)}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(o.created_at)}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Seus Cursos</h2>
          <Link href="/dashboard/courses" className="text-xs text-mystic-600 hover:underline">Ver todos →</Link>
        </div>
        {courses.length === 0
          ? <div className="py-10 text-center"><p className="text-sm text-gray-400 mb-3">Nenhum curso criado.</p>
            <Link href="/dashboard/courses/new" className="text-sm text-mystic-600 hover:underline">Criar primeiro curso</Link></div>
          : courses.slice(0, 5).map((c: any) => (
            <Link key={c.id} href={`/dashboard/courses/edit?id=${c.id}`} className="flex items-center gap-4 px-5 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-mystic-100 overflow-hidden shrink-0">
                {c.cover_image_url ? <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🔮</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-xs text-gray-400">{c.total_lessons} aulas · {c.total_modules} módulos</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{c.price === 0 ? <span className="text-emerald-600 text-xs">GRÁTIS</span> : formatCurrency(c.price)}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.is_published ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}
