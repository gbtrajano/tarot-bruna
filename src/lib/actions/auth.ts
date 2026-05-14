'use server'
import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
const registerSchema = z.object({
  full_name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export async function login(_: unknown, formData: FormData) {
  const raw = { email: formData.get('email') as string, password: formData.get('password') as string }
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'E-mail ou senha incorretos.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Erro ao autenticar.' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role === 'seller' || profile?.role === 'admin') redirect('/dashboard')
  else redirect('/catalog')
}

export async function register(_: unknown, formData: FormData) {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name, role: 'student' } },
  })

  if (error) {
    if (error.message.includes('already registered')) return { error: 'E-mail já cadastrado. Tente fazer login.' }
    return { error: `Erro: ${error.message}` }
  }
  if (!data.user) return { error: 'Confirme seu e-mail antes de continuar.' }

  // Fallback: garante criação do perfil caso o trigger falhe
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', data.user.id).single()
  if (!existing) {
    await supabase.from('profiles').insert({
      id: data.user.id, email: parsed.data.email,
      full_name: parsed.data.full_name, role: 'student',
    })
  }
  redirect('/catalog')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}
