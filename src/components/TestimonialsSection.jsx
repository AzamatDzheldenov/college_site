import { Quote } from 'lucide-react'
import { useContent } from '../context/ContentContext'

function TestimonialsSection() {
  const { content, language, text } = useContent()
  const testimonials = content?.staticPages?.home?.testimonials || []
  const title = language === 'ky' ? 'Студенттердин пикирлери' : 'Отзывы студентов'
  const subtitle = language === 'ky' ? 'Колледж жөнүндө эмне дешет' : 'Что говорят о колледже'

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="section-pad">
      <div className="page-shell">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">{title}</p>
          <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">{subtitle}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={text(item.name)} className="glass-panel-strong rounded-[20px] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <Quote size={21} />
              </span>
              <p className="mt-5 text-base leading-7 text-text">{text(item.text)}</p>
              <div className="mt-6 border-t border-line/60 pt-4">
                <p className="font-semibold text-text">{text(item.name)}</p>
                <p className="mt-1 text-sm text-muted">{text(item.program)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
