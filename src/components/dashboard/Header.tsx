'use client'
import { Bell } from 'lucide-react'

export function Header({ user }: { user: any }) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-md">
        <input placeholder="Buscar..." className="w-full h-8 rounded-lg border bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-mystic-300" />
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 relative">
          <Bell size={14} />
        </button>
        <div className="w-8 h-8 rounded-full bg-mystic-100 flex items-center justify-center text-sm font-semibold text-mystic-700">
          {user.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
