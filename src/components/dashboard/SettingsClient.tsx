'use client'
import React, { useState, useTransition } from 'react'
import { saveSellerProfile } from '../../lib/actions/dashboard'
import { User, CreditCard, Landmark, Save, CheckCircle, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tab = 'profile' | 'payment' | 'bank'

export function SettingsClient({ profile }: { profile: any }) {
  const [tab, setTab] = useState<Tab>('profile')
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [gateway, setGateway] = useState(profile?.payment_gateway || '')

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'payment', label: 'Gateway', icon: CreditCard },
    { id: 'bank', label: 'Banco / Pix', icon: Landmark },
  ]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await saveSellerProfile(fd)
      if (!r?.error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    })
  }

  const inp = 'w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-mystic-400 bg-white'

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Configurações</h1>
        <p className="text-gray-500 text-sm mt-0.5">Perfil, gateway de pagamento e dados bancários</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id ? 'border-mystic-600 text-mystic-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-sm flex items-center gap-2"><User size={15} /> Informações do Instrutor</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio / Apresentação</label>
              <textarea name="bio" defaultValue={profile?.bio || ''} placeholder="Conte sobre você e sua experiência com Tarot..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mystic-400 bg-white min-h-[120px] resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Website ou rede social</label>
              <input name="website" type="url" defaultValue={profile?.website || ''} placeholder="https://seusite.com.br" className={inp} />
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {tab === 'payment' && (
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-sm flex items-center gap-2"><CreditCard size={15} /> Gateway de Pagamento</h2>
            <p className="text-xs text-gray-400">Escolha como vai receber os pagamentos das vendas.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'mercadopago', label: 'Mercado Pago', desc: 'Pix, boleto e cartão. Recomendado para o Brasil.', emoji: '💙', badge: 'Brasil' },
                { value: 'stripe', label: 'Stripe', desc: 'Cartão internacional.', emoji: '⚡', badge: 'Internacional' },
              ].map(gw => (
                <label key={gw.value} className={cn('flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  gateway === gw.value ? 'border-mystic-500 bg-mystic-50' : 'border-gray-200 hover:border-gray-300')}>
                  <input type="radio" name="payment_gateway" value={gw.value} className="sr-only" checked={gateway === gw.value} onChange={() => setGateway(gw.value)} />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{gw.emoji}</span>
                    {gateway === gw.value && <CheckCircle size={15} className="text-mystic-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{gw.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{gw.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mystic-100 text-mystic-700 self-start">{gw.badge}</span>
                </label>
              ))}
            </div>

            {gateway === 'mercadopago' && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-2"><ShieldCheck size={14} /> Mercado Pago</p>
                <div>
                  <label className="text-xs font-medium text-blue-700 block mb-1">Access Token de Produção</label>
                  <input name="mercadopago_access_token" type="password" defaultValue={profile?.mercadopago_access_token || ''} placeholder="APP_USR-..." className={inp} />
                </div>
                <p className="text-xs text-blue-600">Obtenha em: <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="underline">mercadopago.com.br/developers</a></p>
              </div>
            )}

            {gateway === 'stripe' && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
                <p className="text-sm font-semibold text-indigo-800 flex items-center gap-2"><ShieldCheck size={14} /> Stripe</p>
                <div>
                  <label className="text-xs font-medium text-indigo-700 block mb-1">Account ID (Stripe Connect)</label>
                  <input name="stripe_account_id" defaultValue={profile?.stripe_account_id || ''} placeholder="acct_..." className={inp} />
                </div>
                <p className="text-xs text-indigo-600">Configure em: <a href="https://stripe.com/connect" target="_blank" rel="noopener noreferrer" className="underline">stripe.com/connect</a></p>
              </div>
            )}
          </div>
        )}

        {/* BANK */}
        {tab === 'bank' && (
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Landmark size={15} /> Dados Bancários & Pix</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">CPF ou CNPJ</label>
              <input name="cpf_cnpj" defaultValue={profile?.cpf_cnpj || ''} placeholder="000.000.000-00" className={inp} />
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">⚡ Chave Pix</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-emerald-700 block mb-1">Tipo da chave</label>
                  <select name="pix_key_type" defaultValue={profile?.pix_key_type || ''} className={inp}>
                    <option value="">Selecione</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Celular</option>
                    <option value="random">Chave aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-emerald-700 block mb-1">Chave Pix</label>
                  <input name="pix_key" defaultValue={profile?.pix_key || ''} placeholder="Sua chave Pix" className={inp} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Conta bancária (TED)</p>
              <input name="bank_name" defaultValue={profile?.bank_name || ''} placeholder="Banco (ex: Nubank, Itaú...)" className={inp} />
              <div className="grid grid-cols-2 gap-3">
                <input name="bank_agency" defaultValue={profile?.bank_agency || ''} placeholder="Agência" className={inp} />
                <input name="bank_account" defaultValue={profile?.bank_account || ''} placeholder="Conta" className={inp} />
              </div>
              <select name="bank_account_type" defaultValue={profile?.bank_account_type || ''} className={inp}>
                <option value="">Tipo de conta</option>
                <option value="checking">Conta Corrente</option>
                <option value="savings">Conta Poupança</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5"><CheckCircle size={14} /> Salvo!</span>}
          <button type="submit" disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl mystic-gradient text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 shadow-sm">
            <Save size={14} />{pending ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
