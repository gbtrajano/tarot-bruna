import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { course_id, full_name, email, cpf, payment_method, coupon_code } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { data: course } = await supabase.from('courses').select('*').eq('id', course_id).eq('is_published', true).single()
    if (!course) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })

    const { data: existing } = await supabase.from('enrollments').select('id').eq('student_id', user.id).eq('course_id', course_id).single()
    if (existing) return NextResponse.json({ error: 'Você já está matriculado.' }, { status: 400 })

    let discountAmount = 0, couponId = null
    if (coupon_code) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', coupon_code.toUpperCase()).eq('is_active', true).single()
      if (coupon) {
        const valid = (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (!coupon.max_uses || coupon.used_count < coupon.max_uses) && (!coupon.course_id || coupon.course_id === course_id)
        if (valid) {
          couponId = coupon.id
          discountAmount = coupon.discount_type === 'percent' ? (course.price * coupon.discount_value) / 100 : Math.min(coupon.discount_value, course.price)
          await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id)
        }
      }
    }

    const finalAmount = Math.max(0, course.price - discountAmount)

    if (finalAmount === 0) {
      await supabase.from('enrollments').insert({ student_id: user.id, course_id })
      await supabase.from('orders').insert({
        student_id: user.id, course_id, seller_id: course.seller_id,
        amount: 0, status: 'paid', payment_method: payment_method || null,
        coupon_id: couponId, discount_amount: discountAmount, paid_at: new Date().toISOString(),
      })
      return NextResponse.json({ success: true })
    }

    const { data: sellerProfile } = await supabase.from('seller_profiles').select('payment_gateway, mercadopago_access_token, stripe_account_id').eq('user_id', course.seller_id).single()
    if (!sellerProfile?.payment_gateway) return NextResponse.json({ error: 'Gateway de pagamento não configurado.' }, { status: 400 })

    const { data: order } = await supabase.from('orders').insert({
      student_id: user.id, course_id, seller_id: course.seller_id,
      amount: finalAmount, status: 'pending', payment_method,
      payment_gateway: sellerProfile.payment_gateway, coupon_id: couponId, discount_amount: discountAmount,
    }).select().single()

    if (!order) return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 })

    if (sellerProfile.payment_gateway === 'mercadopago') {
      const mpToken = sellerProfile.mercadopago_access_token
      if (!mpToken) return NextResponse.json({ error: 'Token Mercado Pago não configurado.' }, { status: 400 })

      if (payment_method === 'pix') {
        const res = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mpToken}`, 'X-Idempotency-Key': order.id },
          body: JSON.stringify({
            transaction_amount: finalAmount, description: course.title, payment_method_id: 'pix',
            payer: { email, first_name: full_name.split(' ')[0], last_name: full_name.split(' ').slice(1).join(' ') },
            external_reference: order.id,
          }),
        })
        const data = await res.json()
        if (data.id) {
          await supabase.from('orders').update({ gateway_payment_id: String(data.id) }).eq('id', order.id)
          return NextResponse.json({ success: true, pix: true, qr_code: data.point_of_interaction?.transaction_data?.qr_code, order_id: order.id })
        }
        return NextResponse.json({ error: 'Erro ao gerar Pix.' }, { status: 500 })
      }

      const prefRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mpToken}` },
        body: JSON.stringify({
          items: [{ title: course.title, quantity: 1, unit_price: finalAmount, currency_id: 'BRL' }],
          payer: { name: full_name, email },
          external_reference: order.id,
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook?gateway=mercadopago`,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/course/${course_id}?enrolled=true`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${course_id}?error=true`,
          },
          auto_return: 'approved',
        }),
      })
      const prefData = await prefRes.json()
      if (prefData.id) return NextResponse.json({ success: true, redirect_url: prefData.init_point, order_id: order.id })
      return NextResponse.json({ error: 'Erro ao criar preferência.' }, { status: 500 })
    }

    if (sellerProfile.payment_gateway === 'stripe') {
      const stripe = (await import('stripe')).default
      const client = new stripe(process.env.STRIPE_SECRET_KEY!)
      const session = await client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'brl', product_data: { name: course.title }, unit_amount: Math.round(finalAmount * 100) }, quantity: 1 }],
        mode: 'payment', customer_email: email,
        metadata: { order_id: order.id, course_id, student_id: user.id },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/course/${course_id}?enrolled=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${course_id}`,
      })
      await supabase.from('orders').update({ gateway_payment_id: session.id }).eq('id', order.id)
      return NextResponse.json({ success: true, redirect_url: session.url })
    }

    return NextResponse.json({ error: 'Gateway inválido.' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
