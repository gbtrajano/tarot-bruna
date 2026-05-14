'use client'
import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { createClient } from '../../lib/supabase/client'

interface Props {
  lessonId: string
  enrollmentId: string
  studentId: string
  courseId: string
  isCompleted: boolean
}

export function MarkCompleteButton({ lessonId, enrollmentId, studentId, courseId, isCompleted: init }: Props) {
  const [done, setDone] = useState(init)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('lesson_progress').upsert({
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      student_id: studentId,
      completed: !done,
      completed_at: !done ? new Date().toISOString() : null,
    }, { onConflict: 'enrollment_id,lesson_id' })
    setDone(v => !v)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${done ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-mystic-800 text-mystic-300 hover:bg-mystic-700 hover:text-white'}`}>
      {done ? <CheckCircle size={15} /> : <Circle size={15} />}
      {done ? 'Concluída' : 'Marcar como concluída'}
    </button>
  )
}
