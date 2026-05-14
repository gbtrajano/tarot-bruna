'use client'
import { useActionState, useState } from 'react'
import { register } from '../../lib/actions/auth'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, null)
  const [show, setShow] = useState(false)

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 mystic-gradient flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
        <div className="relative text-center text-white space-y-4">
          <div className="text-7xl mb-4">✨</div>
          <h1 className="text-4xl font-display font-bold">Comece sua jornada</h1>
          <p className="text-purple-200 text-lg max-w-xs">Crie sua conta gratuita e acesse os melhores cursos de Tarot.</p>
          <div className="flex flex-col gap-2 mt-8 text-sm text-purple-200">
            <span>🔮 Acesso imediato após cadastro</span>
            <span>📚 Catálogo completo de cursos</span>
            <span>🎓 Certificado de conclusão</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <Link href="/catalog" className="text-2xl font-display font-bold text-purple-700 lg:hidden">🔮 Arcana</Link>
            <h2 className="text-2xl font-display font-bold mt-2">Criar sua conta</h2>
            <p className="text-gray-500 text-sm mt-1">
              Já tem conta?{' '}
              <Link href="/login" className="text-purple-600 font-medium hover:underline">Entrar</Link>
            </p>
          </div>

          <form action={action} className="space-y-4">
            <input type="hidden" name="role" value="student" />
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{state.error}</div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-sm font-medium text-gray-700">Nome completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="full_name" name="full_name" required autoComplete="name" placeholder="Seu nome completo"
                  className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="seu@email.com"
                  className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="password" name="password" type={show ? 'text' : 'password'} required placeholder="Mínimo 6 caracteres"
                  className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white" />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={pending}
              className="w-full h-12 rounded-xl mystic-gradient text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg flex items-center justify-center">
              {pending ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
            <p className="text-center text-xs text-gray-400">
              Ao criar uma conta você concorda com os{' '}
              <Link href="/terms" className="text-purple-600 hover:underline">Termos de uso</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
