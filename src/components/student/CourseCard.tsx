import Link from 'next/link'
import { Clock, BookOpen } from 'lucide-react'
import { formatCurrency, formatDuration } from '../../lib/utils'

export function CourseCard({ course }: { course: any }) {
  const isFree = course.price === 0
  return (
    <Link href={`/course/${course.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="relative aspect-video overflow-hidden bg-mystic-900">
        {course.cover_image_url
          ? <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🔮</div>
        }
        <div className="absolute top-3 right-3">
          {isFree
            ? <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">GRÁTIS</span>
            : <span className="bg-black/70 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-lg">{formatCurrency(course.price)}</span>
          }
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        {course.category && <span className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400">{course.category.replace(/-/g, ' ')}</span>}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-yellow-300 transition-colors">{course.title}</h3>
        {course.short_description && <p className="text-xs text-mystic-300 line-clamp-2">{course.short_description}</p>}
        <div className="flex items-center gap-3 text-xs text-mystic-400 mt-auto pt-2 border-t border-white/5">
          <span className="flex items-center gap-1"><BookOpen size={10} />{course.total_lessons} aulas</span>
          {course.total_duration_minutes > 0 && <span className="flex items-center gap-1"><Clock size={10} />{formatDuration(course.total_duration_minutes)}</span>}
        </div>
        {course.seller?.full_name && <p className="text-[10px] text-mystic-500">por <span className="text-mystic-300">{course.seller.full_name}</span></p>}
      </div>
    </Link>
  )
}
