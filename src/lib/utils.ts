import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
export function formatDate(d: string | Date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(d))
}
export function formatDuration(m: number) {
  if (m < 60) return `${Math.round(m)}min`
  const h = Math.floor(m / 60), min = Math.round(m % 60)
  return min > 0 ? `${h}h ${min}min` : `${h}h`
}
export function slugify(t: string) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}
export function formatCPF(v: string) {
  return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14)
}
export function formatCard(v: string) {
  return v.replace(/\D/g,'').replace(/(\d{4})(\d)/,'$1 $2').replace(/(\d{4})(\d)/,'$1 $2').replace(/(\d{4})(\d)/,'$1 $2').slice(0,19)
}
export function formatExpiry(v: string) {
  return v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').slice(0,5)
}
