import { getCourseWithModules } from '../../../../lib/actions/courses'
import { CourseEditor } from '../../../../components/dashboard/CourseEditor'
import { notFound } from 'next/navigation'

export default async function EditCoursePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  if (!id) notFound()

  const { course, modules } = await getCourseWithModules(id)
  if (!course) notFound()

  return <CourseEditor course={course} modules={modules} />
}
