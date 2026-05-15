import Link from "next/link";
import { getUser } from "../../lib/actions/auth";
import { logout } from "../../lib/actions/auth";
import { GraduationCap } from "lucide-react";

export async function StudentHeader() {
  const user = await getUser();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-mystic-950/80 backdrop-blur border-b border-white/10">
      <Link
        href="/catalog"
        className="flex items-center gap-2.5 text-white font-display font-semibold"
      >
        <span className="text-xl">🔮</span>
        <span>Entre Rosas e Cartas</span>
      </Link>
      <nav className="flex items-center gap-4">
        {user ? (
          <>
            {(user.role === "seller" || user.role === "admin") && (
              <Link
                href="/dashboard"
                className="text-xs text-mystic-300 hover:text-white transition-colors"
              >
                Painel do instrutor
              </Link>
            )}
            <Link
              href="/my-courses"
              className="text-xs text-mystic-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <GraduationCap size={13} /> Meus cursos
            </Link>
            <form action={logout}>
              <button className="text-xs text-mystic-400 hover:text-white transition-colors">
                Sair
              </button>
            </form>
            <div className="w-7 h-7 rounded-full bg-mystic-700 flex items-center justify-center text-xs font-semibold text-white">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-xs text-mystic-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg bg-mystic-600 hover:bg-mystic-500 text-white text-xs font-medium transition-colors"
            >
              Cadastrar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
