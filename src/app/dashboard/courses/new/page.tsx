'use client'
import { useTransition, useState } from 'react'
import { createCourse } from '../../../../lib/actions/courses'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

const CATS = [
  { value: 'tarot-basico', label: 'Tarot Básico' },
  { value: 'tarot-avancado', label: 'Tarot Avançado' },
  { value: 'tarot-terapeutico', label: 'Tarot Terapêutico' },
  { value: 'arcanos-maiores', label: 'Arcanos Maiores' },
  { value: 'arcanos-menores', label: 'Arcanos Menores' },
  { value: 'numerologia', label: 'Numerologia' },
  { value: 'espiritualidade', label: 'Espiritualidade' },
]

const inp = 'w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white'

export default function NewCoursePage() {
  const [pending, startTransition] = useTransition()
  const [isFree, setIsFree] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => createCourse(fd))
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/courses" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={16} /></Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Novo Curso</h1>
          <p className="text-gray-500 text-sm">Preencha as informações básicas para começar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-6 rounded-2xl border bg-white shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Título do curso *</label>
            <input name="title" required placeholder="Ex: Tarot do Zero ao Avançado" className={inp} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição curta *</label>
            <textarea name="short_description" required placeholder="Uma frase que resume o curso..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[80px] resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Categoria</label>
            <select name="category" className={inp}>
              <option value="">Selecione</option>
              {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Precificação</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[{ val: false, label: '💳 Curso pago' }, { val: true, label: '🎁 Gratuito' }].map(opt => (
                <button key={String(opt.val)} type="button" onClick={() => setIsFree(opt.val)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${isFree === opt.val ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {!isFree && <input name="price" type="number" min="0" step="0.01" defaultValue="97" placeholder="Valor em R$" className={inp} />}
            {isFree && <input type="hidden" name="price" value="0" />}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
          <Sparkles size={15} className="text-purple-500 mt-0.5 shrink-0" />
          <p className="text-sm text-purple-700">Após criar, você adiciona módulos, aulas, vídeos e a capa do curso.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/courses" className="flex-1 h-11 rounded-xl border flex items-center justify-center text-sm font-medium hover:bg-gray-50">Cancelar</Link>
          <button type="submit" disabled={pending}
            className="flex-1 h-11 rounded-xl mystic-gradient text-white font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
            {pending ? 'Criando...' : '✨ Criar e editar'}
          </button>
        </div>
      </form>
    </div>
  )
}
