import { getCourseWithModules } from '../../../lib/actions/courses'
import { notFound } from 'next/navigation'
import { CheckoutForm } from '../../../components/checkout/CheckoutForm'
import { StudentHeader } from '../../../components/student/StudentHeader'
import { formatCurrency } from '../../../lib/utils'
import { ShieldCheck, BookOpen, Clock } from 'lucide-react'

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { course, modules } = await getCourseWithModules(id)
  if (!course || !course.is_published) notFound()

  const totalLessons = modules.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0)
  const isFree = course.price === 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2d0a0a, #4a1515, #2d0a0a)' }}>
      <StudentHeader />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-medium mb-4">
              <ShieldCheck size={12} /> Pagamento 100% seguro e criptografado
            </div>
            <h1 className="text-3xl font-display font-bold text-white">
              {isFree ? 'Inscreva-se gratuitamente' : 'Complete sua compra'}
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <CheckoutForm course={course} isFree={isFree} />
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {course.cover_image_url
                  ? <img src={course.cover_image_url} alt={course.title} className="w-full aspect-video object-cover" />
                  : <div className="aspect-video bg-mystic-900 flex items-center justify-center text-5xl">🔮</div>
                }
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-mystic-400 uppercase tracking-wider mb-1">Você está adquirindo</p>
                    <h3 className="text-white font-semibold">{course.title}</h3>
                    {course.short_description && <p className="text-mystic-300 text-xs mt-1 line-clamp-2">{course.short_description}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-mystic-400">
                    <span className="flex items-center gap-1"><BookOpen size={11} />{totalLessons} aulas</span>
                    <span className="flex items-center gap-1"><Clock size={11} />Acesso vitalício</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm text-mystic-300 mb-1">
                      <span>Subtotal</span><span>{isFree ? 'R$ 0,00' : formatCurrency(course.price)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-base">
                      <span>Total</span>
                      <span>{isFree ? <span className="text-emerald-400">Gratuito</span> : formatCurrency(course.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mystic-400">
                    <ShieldCheck size={11} className="text-emerald-500" /> Dados protegidos com SSL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
