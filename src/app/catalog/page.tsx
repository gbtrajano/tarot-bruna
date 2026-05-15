import { getPublishedCourses } from "../../lib/actions/courses";
import { StudentHeader } from "../../components/student/StudentHeader";
import { CourseCard } from "../../components/student/CourseCard";
import { Search, Sparkles } from "lucide-react";

export default async function CatalogPage() {
  const courses = await getPublishedCourses();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#2d0a0a" }}>
      <StudentHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,64,64,0.35) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 text-xs font-medium mb-6">
            <Sparkles size={12} /> Desperte seu potencial intuitivo
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
            Entre Rosas e Cartas Sua jornada na cartomancia{" "}
            <span className="gold-text">começa aqui.</span>
          </h1>
          <p className="text-mystic-200 text-lg mb-8">
            Formação completa em Baralho de Esquerda: técnica, prática e interpretação.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-mystic-400"
            />
            <input
              placeholder="Buscar cursos de tarot..."
              className="w-full h-12 rounded-xl pl-10 pr-4 text-white placeholder:text-mystic-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="mb-8">
          <h2 className="text-xl font-display font-semibold text-white">
            {courses.length > 0
              ? `${courses.length} curso${courses.length !== 1 ? "s" : ""} disponíve${courses.length !== 1 ? "is" : "l"}`
              : "Em breve"}
          </h2>
          <p className="text-mystic-300 text-sm mt-0.5">
            Encontre o curso ideal para sua jornada
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-mystic-300 text-lg">
              Os primeiros cursos chegam em breve...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c: any) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
