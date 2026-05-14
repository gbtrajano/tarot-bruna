'use server'
import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: courses } = await supabase.from('courses').select('id, is_published').eq('seller_id', user.id)
  const courseIds = courses?.map(c => c.id) || []

  const { data: orders } = await supabase.from('orders').select('amount, status, created_at, paid_at, course_id, student_id, course:courses(title), student:profiles(full_name, email)').eq('seller_id', user.id).order('created_at', { ascending: false })

  const paidOrders = (orders || []).filter((o: any) => o.status === 'paid')
  const totalRevenue = paidOrders.reduce((s: number, o: any) => s + o.amount, 0)

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthRevenue = paidOrders.filter((o: any) => (o.paid_at || o.created_at) >= firstOfMonth).reduce((s: number, o: any) => s + o.amount, 0)

  let enrollments: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabase.from('enrollments').select('student_id, enrolled_at').in('course_id', courseIds)
    enrollments = data || []
  }

  const revenueByMonth: { month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const rev = paidOrders.filter((o: any) => { const oc = new Date(o.created_at); return oc >= d && oc < end }).reduce((s: number, o: any) => s + o.amount, 0)
    revenueByMonth.push({ month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), revenue: rev })
  }

  return {
    total_students: new Set(enrollments.map(e => e.student_id)).size,
    total_enrollments: enrollments.length,
    total_revenue: totalRevenue,
    total_courses: courses?.length || 0,
    total_published: courses?.filter(c => c.is_published).length || 0,
    revenue_this_month: monthRevenue,
    new_enrollments_this_month: enrollments.filter(e => e.enrolled_at >= firstOfMonth).length,
    revenue_by_month: revenueByMonth,
    recent_orders: (orders || []).slice(0, 8),
  }
}

export async function getSellerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).single()
  return data
}

export async function saveSellerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('seller_profiles').upsert({
    user_id: user.id,
    bio: formData.get('bio') as string || null,
    website: formData.get('website') as string || null,
    payment_gateway: formData.get('payment_gateway') as string || null,
    stripe_account_id: formData.get('stripe_account_id') as string || null,
    mercadopago_access_token: formData.get('mercadopago_access_token') as string || null,
    bank_name: formData.get('bank_name') as string || null,
    bank_agency: formData.get('bank_agency') as string || null,
    bank_account: formData.get('bank_account') as string || null,
    bank_account_type: formData.get('bank_account_type') as string || null,
    cpf_cnpj: formData.get('cpf_cnpj') as string || null,
    pix_key: formData.get('pix_key') as string || null,
    pix_key_type: formData.get('pix_key_type') as string || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}
