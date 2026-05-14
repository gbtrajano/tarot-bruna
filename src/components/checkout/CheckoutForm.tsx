'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, CreditCard, Tag, ChevronRight, Check, Lock } from 'lucide-react'
import { formatCard, formatExpiry, formatCPF } from '../../lib/utils'

const methods = [
  { id: 'pix', label: 'Pix', desc: 'Aprovação instantânea', emoji: '⚡', badge: 'Mais rápido' },
  { id: 'card', label: 'Cartão de Crédito', desc: 'Parcelamento disponível', emoji: '💳', badge: null },
  { id: 'boleto', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias', emoji: '📄', badge: null },
]

const inp = 'w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all placeholder:text-gray-400'

export function CheckoutForm({ course, isFree }: { course: any; isFree: boolean }) {
  const router = useRouter()
  const [method, setMethod] = useState('pix')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [cpf, setCpf] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          full_name: fd.get('full_name'),
          email: fd.get('email'),
          cpf, payment_method: method,
          card_number: card, card_expiry: expiry,
          card_cvc: fd.get('card_cvc'),
          card_holder_name: fd.get('card_holder_name'),
          coupon_code: coupon,
        }),
      })
      const data = await res.json()
      if (data.redirect_url) { window.location.href = data.redirect_url; return }
      if (data.success) setDone(true)
      else alert(data.error || 'Erro ao processar. Tente novamente.')
    } catch { alert('Erro de conexão.') }
    finally { setSubmitting(false) }
  }

  if (done) return (
    <div className="rounded-2xl bg-white p-10 text-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <Check size={28} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-display font-bold">{isFree ? 'Inscrição confirmada! 🎉' : 'Pagamento confirmado! 🎉'}</h2>
      <p className="text-gray-500">Acesso liberado. Você pode começar agora mesmo!</p>
      <button onClick={() => router.push(`/course/${course.id}`)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mystic-gradient text-white font-semibold hover:opacity-90">
        Acessar o curso <ChevronRight size={16} />
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dados pessoais */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">1</span>
          Seus dados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nome completo</label>
            <input name="full_name" required placeholder="Como aparece no documento" className={inp} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">E-mail</label>
            <input name="email" type="email" required placeholder="seu@email.com" className={inp} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">CPF</label>
            <input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} className={inp} />
          </div>
        </div>
      </div>

      {!isFree && (
        <>
          {/* Forma de pagamento */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Forma de pagamento
            </h2>
            <div className="space-y-2">
              {methods.map(m => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === m.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment_method" value={m.id} className="sr-only" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{m.label}</span>
                      {m.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{m.badge}</span>}
                    </div>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                    {method === m.id && <Check size={10} className="text-white" />}
                  </div>
                </label>
              ))}
            </div>
            {method === 'card' && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Nome no cartão</label>
                  <input name="card_holder_name" placeholder="NOME NO CARTÃO" className={`${inp} uppercase`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Número</label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19} className={`${inp} pl-9 tracking-widest`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Validade</label>
                    <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" maxLength={5} className={inp} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">CVV</label>
                    <div className="relative">
                      <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="card_cvc" placeholder="000" maxLength={4} className={`${inp} pl-9`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {method === 'pix' && <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800 border border-emerald-200">⚡ Um QR Code Pix será gerado. Acesso liberado em menos de 1 minuto após o pagamento.</div>}
            {method === 'boleto' && <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 border border-amber-200">📄 O boleto será enviado ao seu e-mail. Vencimento: 3 dias úteis.</div>}
          </div>

          {/* Cupom */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag size={14} /> Cupom de desconto</h3>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="SEUCUPOM" className={`${inp} flex-1 uppercase tracking-widest`} />
              <button type="button" className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors">Aplicar</button>
            </div>
          </div>
        </>
      )}

      <button type="submit" disabled={submitting}
        className="w-full h-14 rounded-2xl font-bold text-base text-white mystic-gradient shadow-xl hover:opacity-95 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all">
        {submitting
          ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processando...</>
          : isFree
            ? <>🎓 Garantir acesso gratuito <ChevronRight size={18} /></>
            : <><ShieldCheck size={18} /> Finalizar compra <ChevronRight size={18} /></>
        }
      </button>
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={11} className="text-emerald-500" /> Criptografia SSL de 256 bits
      </p>
    </form>
  )
}
