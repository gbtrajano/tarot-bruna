import { createClient } from '../../../lib/supabase/server'
import { getUser } from '../../../lib/actions/auth'
import { formatCurrency, formatDate } from '../../../lib/utils'
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'

export default async function FinancesPage() {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*, course:courses(title), student:profiles(full_name, email)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const paid = (orders || []).filter((o: any) => o.status === 'paid')
  const totalRevenue = paid.reduce((s: number, o: any) => s + o.amount, 0)
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRevenue = paid
    .filter((o: any) => new Date(o.paid_at || o.created_at) >= firstOfMonth)
    .reduce((s: number, o: any) => s + o.amount, 0)

  const statusStyle: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }
  const statusLabel: Record<string, string> = {
    paid: 'Pago', pending: 'Pendente', failed: 'Falhou', refunded: 'Reembolsado',
  }
  const methodLabel: Record<string, string> = {
    pix: '⚡ Pix', card: '💳 Cartão', boleto: '📄 Boleto',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-display font-bold">Financeiro</h1>
        <p className="text-gray-500 text-sm mt-0.5">Acompanhe suas receitas e transações</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Receita total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Este mês', value: formatCurrency(monthRevenue), icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
          { label: 'Vendas realizadas', value: String(paid.length), icon: ShoppingCart, color: 'bg-mystic-100 text-mystic-700' },
        ].map(c => (
          <div key={c.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon size={18} /></div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-gray-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-sm">Histórico de transações</h2>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Nenhuma transação ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Aluno', 'Curso', 'Método', 'Valor', 'Status', 'Data'].map(h => (
                    <th key={h} className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {(orders as any[]).map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-xs">{o.student?.full_name || 'Aluno'}</p>
                      <p className="text-xs text-gray-400">{o.student?.email}</p>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 max-w-[140px] truncate">{o.course?.title || '—'}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{o.payment_method ? methodLabel[o.payment_method] : '—'}</td>
                    <td className="px-6 py-3 font-semibold text-sm">
                      {o.amount === 0 ? <span className="text-emerald-600 text-xs font-semibold">Grátis</span> : formatCurrency(o.amount)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">{formatDate(o.created_at)}</td>
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
