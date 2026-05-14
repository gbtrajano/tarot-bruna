'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Users, DollarSign, Settings, LogOut, GraduationCap, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { logout } from '../../lib/actions/auth'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/courses', label: 'Cursos', icon: BookOpen },
  { href: '/dashboard/students', label: 'Alunos', icon: Users },
  { href: '/dashboard/finances', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()
  return (
    <aside className="w-64 flex flex-col bg-mystic-950 text-white shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-mystic-800">
        <div className="w-8 h-8 rounded-lg mystic-gradient flex items-center justify-center text-lg">🔮</div>
        <div>
          <p className="font-display font-semibold text-sm">Arcana</p>
          <p className="text-[10px] text-mystic-400 uppercase tracking-widest">Painel do Instrutor</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-mystic-700 text-white' : 'text-mystic-300 hover:bg-mystic-800 hover:text-white')}>
              <item.icon size={16} className="shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 pb-2">
        <Link href="/catalog" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-mystic-400 hover:bg-mystic-800 hover:text-white transition-colors">
          <GraduationCap size={16} /><span>Ver como aluno</span>
        </Link>
      </div>
      <div className="border-t border-mystic-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-mystic-700 flex items-center justify-center text-sm font-semibold">
            {user.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name || 'Usuário'}</p>
            <p className="text-xs text-mystic-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-mystic-400 hover:bg-mystic-800 hover:text-white transition-colors">
            <LogOut size={14} />Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
