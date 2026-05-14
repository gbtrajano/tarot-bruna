'use server'
import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '../utils'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string) || 0

  const { data, error } = await supabase.from('courses').insert({
    seller_id: user.id,
    title,
    slug: slugify(title) + '-' + Date.now(),
    description: formData.get('description') as string || '',
    short_description: formData.get('short_description') as string || null,
    price,
    category: formData.get('category') as string || null,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/courses')
  redirect(`/dashboard/courses/edit?id=${data.id}`)
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const whatYouLearn = (formData.get('what_you_learn') as string)?.split('\n').map(s => s.trim()).filter(Boolean) || []
  const requirements = (formData.get('requirements') as string)?.split('\n').map(s => s.trim()).filter(Boolean) || []

  const { error } = await supabase.from('courses').update({
    title, slug: slugify(title) + '-' + courseId.slice(0, 8),
    description: formData.get('description') as string,
    short_description: formData.get('short_description') as string || null,
    price, category: formData.get('category') as string || null,
    target_audience: formData.get('target_audience') as string || null,
    what_you_learn: whatYouLearn, requirements,
    updated_at: new Date().toISOString(),
  }).eq('id', courseId).eq('seller_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function togglePublish(courseId: string, publish: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const { error } = await supabase.from('courses').update({ is_published: publish }).eq('id', courseId).eq('seller_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function uploadCourseCover(courseId: string, file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${courseId}/cover.${ext}`
  const { error: up } = await supabase.storage.from('course-covers').upload(path, file, { upsert: true })
  if (up) return { error: up.message }
  const { data: { publicUrl } } = supabase.storage.from('course-covers').getPublicUrl(path)
  await supabase.from('courses').update({ cover_image_url: publicUrl }).eq('id', courseId)
  revalidatePath('/dashboard/courses')
  return { url: publicUrl }
}

export async function createModule(courseId: string, title: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('modules').select('order_index').eq('course_id', courseId).order('order_index', { ascending: false }).limit(1)
  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1
  const { data, error } = await supabase.from('modules').insert({ course_id: courseId, title, order_index: nextIndex }).select().single()
  if (error) return { error: error.message }
  await supabase.rpc('update_course_totals', { p_course_id: courseId })
  revalidatePath('/dashboard/courses')
  return { data }
}

export async function updateModule(moduleId: string, courseId: string, title: string, description?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('modules').update({ title, description }).eq('id', moduleId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function deleteModule(moduleId: string, courseId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)
  if (error) return { error: error.message }
  await supabase.rpc('update_course_totals', { p_course_id: courseId })
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function createLesson(moduleId: string, courseId: string, title: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('lessons').select('order_index').eq('module_id', moduleId).order('order_index', { ascending: false }).limit(1)
  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1
  const { data, error } = await supabase.from('lessons').insert({ module_id: moduleId, course_id: courseId, title, order_index: nextIndex }).select().single()
  if (error) return { error: error.message }
  await supabase.rpc('update_course_totals', { p_course_id: courseId })
  revalidatePath('/dashboard/courses')
  return { data }
}

export async function updateLesson(lessonId: string, courseId: string, fields: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase.from('lessons').update(fields).eq('id', lessonId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function uploadLessonVideo(lessonId: string, courseId: string, file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${courseId}/${lessonId}/video.${ext}`
  const { error: up } = await supabase.storage.from('lesson-videos').upload(path, file, { upsert: true })
  if (up) return { error: up.message }
  const { data: { publicUrl } } = supabase.storage.from('lesson-videos').getPublicUrl(path)
  await supabase.from('lessons').update({ video_url: publicUrl }).eq('id', lessonId)
  revalidatePath('/dashboard/courses')
  return { url: publicUrl }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) return { error: error.message }
  await supabase.rpc('update_course_totals', { p_course_id: courseId })
  revalidatePath('/dashboard/courses')
  return { success: true }
}

export async function getSellerCourses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('courses').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
  return data || []
}

export async function getCourseWithModules(courseId: string) {
  const supabase = await createClient()
  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  const { data: modules } = await supabase.from('modules').select('*, lessons(*)').eq('course_id', courseId).order('order_index', { ascending: true })
  return { course, modules: modules || [] }
}

export async function getPublishedCourses() {
  const supabase = await createClient()
  const { data } = await supabase.from('courses').select('*, seller:profiles(full_name)').eq('is_published', true).order('created_at', { ascending: false })
  return data || []
}
