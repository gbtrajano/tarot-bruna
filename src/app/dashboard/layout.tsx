import { redirect } from 'next/navigation'
import { getUser } from '../../lib/actions/auth'
import { Sidebar } from '../../components/dashboard/Sidebar'
import { Header } from '../../components/dashboard/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role !== 'seller' && user.role !== 'admin') redirect('/catalog')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
