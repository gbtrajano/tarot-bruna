'use client'
import React, { useState, useTransition } from 'react'
import { updateCourse, togglePublish, uploadCourseCover, createModule, deleteModule, createLesson, updateLesson, deleteLesson, uploadLessonVideo } from '../../lib/actions/courses'
import { ArrowLeft, BookOpen, Layers, Settings, Globe, Lock, Save, Upload, Plus, Trash2, ChevronDown, ChevronUp, Video, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '../../lib/utils'

const CATS = [
  { value: 'tarot-basico', label: 'Tarot Básico' },
  { value: 'tarot-avancado', label: 'Tarot Avançado' },
  { value: 'tarot-terapeutico', label: 'Tarot Terapêutico' },
  { value: 'arcanos-maiores', label: 'Arcanos Maiores' },
  { value: 'arcanos-menores', label: 'Arcanos Menores' },
  { value: 'numerologia', label: 'Numerologia' },
  { value: 'espiritualidade', label: 'Espiritualidade' },
]

type Tab = 'info' | 'modules' | 'settings'

export function CourseEditor({ course, modules: initModules }: { course: any; modules: any[] }) {
  const [tab, setTab] = useState<Tab>('info')
  const [modules, setModules] = useState(initModules)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [cover, setCover] = useState(course.cover_image_url)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [isPub, startPub] = useTransition()

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCover(URL.createObjectURL(file))
    const r = await uploadCourseCover(course.id, file)
    if (r?.url) showMsg('Capa atualizada!')
  }

  async function handleSaveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true)
    const r = await updateCourse(course.id, new FormData(e.currentTarget))
    setSaving(false)
    if (r?.error) alert(r.error); else showMsg('Salvo!')
  }

  async function handlePublish() {
    startPub(async () => {
      await togglePublish(course.id, !course.is_published)
      showMsg(course.is_published ? 'Despublicado' : 'Publicado!')
    })
  }

  async function addModule() {
    const title = prompt('Nome do módulo:'); if (!title) return
    const r = await createModule(course.id, title)
    if (r?.data) { setModules(prev => [...prev, { ...r.data, lessons: [] }]); setExpanded(prev => new Set([...prev, r.data.id])) }
  }

  async function removeModule(id: string) {
    if (!confirm('Excluir módulo e todas as aulas?')) return
    await deleteModule(id, course.id)
    setModules(prev => prev.filter(m => m.id !== id))
  }

  async function addLesson(moduleId: string) {
    const r = await createLesson(moduleId, course.id, 'Nova Aula')
    if (r?.data) setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), r.data] } : m))
  }

  async function removeLesson(lessonId: string, moduleId: string) {
    if (!confirm('Excluir esta aula?')) return
    await deleteLesson(lessonId, course.id)
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons?.filter((l: any) => l.id !== lessonId) } : m))
  }

  async function handleVideo(file: File, lessonId: string, moduleId: string) {
    const r = await uploadLessonVideo(lessonId, course.id, file)
    if (r?.url) {
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons?.map((l: any) => l.id === lessonId ? { ...l, video_url: r.url } : l) } : m))
      showMsg('Vídeo enviado!')
    }
  }

  const inp = 'w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white'
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Informações', icon: BookOpen },
    { id: 'modules', label: 'Módulos & Aulas', icon: Layers },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="space-y-5 animate-fadeIn max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/courses" className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="text-xl font-display font-bold truncate max-w-sm">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${course.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {course.is_published ? 'Publicado' : 'Rascunho'}
              </span>
              <span className="text-xs text-gray-400">{course.total_lessons} aulas · {course.total_modules} módulos</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-emerald-600 font-medium">{msg}</span>}
          {course.is_published && (
            <Link href={`/course/${course.id}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50">
              <ExternalLink size={12} /> Ver página
            </Link>
          )}
          <button onClick={handlePublish} disabled={isPub}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${course.is_published ? 'border border-gray-200 hover:bg-gray-50' : 'mystic-gradient text-white hover:opacity-90 shadow-sm'}`}>
            {course.is_published ? <><Lock size={13} /> Despublicar</> : <><Globe size={13} /> Publicar</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}
      {tab === 'info' && (
        <form onSubmit={handleSaveInfo} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cover */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Capa do curso</label>
              <div className="relative group aspect-video rounded-xl border-2 border-dashed overflow-hidden bg-gray-50">
                {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1"><Upload size={20} /><span className="text-xs">Enviar capa</span></div>}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"><Upload size={11} /> Alterar</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleCover} />
                </label>
              </div>
            </div>
            {/* Fields */}
            <div className="lg:col-span-2 space-y-3">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Título *</label><input name="title" defaultValue={course.title} required className={inp} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Descrição curta</label>
                <textarea name="short_description" defaultValue={course.short_description || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[70px] resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Categoria</label>
                  <select name="category" defaultValue={course.category || ''} className={inp}>
                    <option value="">Selecione</option>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Preço (R$) — 0 = grátis</label>
                  <input name="price" type="number" min="0" step="0.01" defaultValue={course.price} className={inp} /></div>
              </div>
            </div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 block mb-1">Descrição completa</label>
            <textarea name="description" defaultValue={course.description} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[140px] resize-y" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">O que o aluno aprenderá (1 por linha)</label>
              <textarea name="what_you_learn" defaultValue={course.what_you_learn?.join('\n') || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[100px] resize-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Requisitos (1 por linha)</label>
              <textarea name="requirements" defaultValue={course.requirements?.join('\n') || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[100px] resize-none" /></div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 block mb-1">Para quem é este curso</label>
            <textarea name="target_audience" defaultValue={course.target_audience || ''} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-h-[70px] resize-none" /></div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg mystic-gradient text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
              <Save size={14} />{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {/* MODULES TAB */}
      {tab === 'modules' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Organize o conteúdo em módulos e aulas.</p>
            <button onClick={addModule} className="flex items-center gap-1.5 px-3 py-2 rounded-lg mystic-gradient text-white text-sm font-medium hover:opacity-90">
              <Plus size={13} /> Novo módulo
            </button>
          </div>
          {modules.length === 0 && (
            <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-400">
              <Layers size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum módulo ainda. Crie o primeiro!</p>
            </div>
          )}
          {modules.map((mod, mIdx) => {
            const open = expanded.has(mod.id)
            return (
              <div key={mod.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(prev => { const n = new Set(prev); open ? n.delete(mod.id) : n.add(mod.id); return n })}>
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">{mIdx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mod.title}</p>
                    <p className="text-xs text-gray-400">{mod.lessons?.length || 0} aulas</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeModule(mod.id) }} className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"><Trash2 size={13} /></button>
                  {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
                {open && (
                  <div className="border-t bg-gray-50">
                    {(mod.lessons || []).map((lesson: any, lIdx: number) => (
                      <LessonRow key={lesson.id} lesson={lesson} index={lIdx} courseId={course.id}
                        onDelete={() => removeLesson(lesson.id, mod.id)}
                        onVideo={(file: File) => handleVideo(file, lesson.id, mod.id)}
                        onSave={(fields: any) => { setModules(prev => prev.map(m => m.id === mod.id ? { ...m, lessons: m.lessons?.map((l: any) => l.id === lesson.id ? { ...l, ...fields } : l) } : m)); updateLesson(lesson.id, course.id, fields) }} />
                    ))}
                    <div className="px-5 py-2.5">
                      <button onClick={() => addLesson(mod.id)} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium">
                        <Plus size={12} /> Adicionar aula
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm">Visibilidade</h2>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">{course.is_published ? 'Publicado' : 'Rascunho'}</p>
                <p className="text-xs text-gray-500">{course.is_published ? 'Visível no catálogo' : 'Só você pode ver'}</p>
              </div>
              <button onClick={handlePublish} disabled={isPub}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${course.is_published ? 'border hover:bg-gray-50' : 'mystic-gradient text-white hover:opacity-90'}`}>
                {course.is_published ? 'Despublicar' : 'Publicar'}
              </button>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-3">Preço atual</h2>
            <p className="text-2xl font-bold">{course.price === 0 ? <span className="text-emerald-600">Gratuito</span> : formatCurrency(course.price)}</p>
            <p className="text-xs text-gray-400 mt-1">Para alterar, vá em Informações → campo Preço</p>
          </div>
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, index, courseId, onDelete, onVideo, onSave }: any) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(lesson.title)
  const [desc, setDesc] = useState(lesson.description || '')
  const [preview, setPreview] = useState(lesson.is_preview)
  const [uploading, setUploading] = useState(false)

  return (
    <div className="border-t first:border-t-0 px-5 py-3 flex items-start gap-3">
      <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">{index + 1}</div>
      <Video size={13} className="text-gray-400 shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400" autoFocus />
            <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-500" placeholder="Descrição breve (opcional)" />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={preview} onChange={e => setPreview(e.target.checked)} className="rounded" />
              Aula de preview (gratuita)
            </label>
            <div className="flex gap-2">
              <button onClick={() => { onSave({ title, description: desc, is_preview: preview }); setEditing(false) }} className="text-xs text-purple-600 font-medium hover:underline">Salvar</button>
              <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-left w-full group">
            <p className="text-sm font-medium group-hover:text-purple-600 transition-colors truncate">{lesson.title}</p>
            {lesson.description && <p className="text-xs text-gray-400 truncate">{lesson.description}</p>}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {preview && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">PREVIEW</span>}
        {lesson.video_url
          ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Vídeo ✓</span>
          : <label className={uploading ? 'opacity-50' : 'cursor-pointer'}>
            <span className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors px-2 py-1 rounded hover:bg-purple-50">
              <Upload size={11} />{uploading ? 'Enviando...' : 'Vídeo'}
            </span>
            <input type="file" accept="video/*" className="sr-only" disabled={uploading} onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); await onVideo(f); setUploading(false) }} />
          </label>
        }
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"><Trash2 size={12} /></button>
      </div>
    </div>
  )
}
