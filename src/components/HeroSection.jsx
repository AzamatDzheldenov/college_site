import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import campusHero from '../assets/campus-hero.jpeg'
import { useContent } from '../context/ContentContext'

function HeroSection() {
  const { content, text } = useContent()
  const hero = content?.staticPages?.home?.hero

  return (
    <section className="relative min-h-[720px] overflow-hidden pt-32 sm:pt-36">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${campusHero})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] dark:bg-black/60" />

      <div className="page-shell relative z-10 grid min-h-[590px] items-end pb-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pb-16">
        <div className="glass-panel rounded-[25px] p-6 sm:p-8 lg:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/60 bg-panel/60 px-3 py-2 text-sm font-medium text-accent backdrop-blur-xl">
            <Sparkles size={16} /> {text(hero?.badge, 'Колледж')}
          </div>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.04] text-text sm:text-6xl lg:text-7xl">
            {text(hero?.title, 'Колледж ИГУ им. К. Тыныстанова')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {text(hero?.text)}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/applicants"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              {text(hero?.primaryButton, 'Абитуриентам')} <ArrowRight size={18} />
            </Link>
            <Link
              to="/about"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-line/70 bg-panel/60 px-5 py-3 text-sm font-semibold text-text backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
            >
              {text(hero?.secondaryButton, 'О колледже')} <BookOpen size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:mt-0 lg:grid-cols-1">
          {(hero?.stats || []).map((item) => (
            <div
              key={`${item.value}-${text(item.label)}`}
              className="glass-panel rounded-[20px] px-5 py-4 transition duration-300 hover:-translate-y-1"
            >
              <p className="text-3xl font-bold text-accent">{item.value}</p>
              <p className="mt-1 text-sm leading-5 text-muted">{text(item.label)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
