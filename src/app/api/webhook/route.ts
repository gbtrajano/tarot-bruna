import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

async function enrollAfterPayment(orderId: string) {
  const supabase = await createClient()
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
  if (!order || order.status === 'paid') return
  await supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', orderId)
  await supabase.from('enrollments').upsert({ student_id: order.student_id, course_id: order.course_id }, { onConflict: 'student_id,course_id' })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gateway = searchParams.get('gateway')

  if (gateway === 'mercadopago') {
    const body = await req.json()
    if (body.type === 'payment' && body.data?.id) {
      const supabase = await createClient()
      const { data: order } = await supabase.from('orders').select('*').eq('gateway_payment_id', String(body.data.id)).single()
      if (order) await enrollAfterPayment(order.id)
    }
    return NextResponse.json({ ok: true })
  }

  if (gateway === 'stripe') {
    const stripe = (await import('stripe')).default
    const client = new stripe(process.env.STRIPE_SECRET_KEY!)
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!
    let event
    try { event = client.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
    catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      if (session.metadata?.order_id) await enrollAfterPayment(session.metadata.order_id)
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })
}
