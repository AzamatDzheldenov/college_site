import { ArrowRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { formatDate, ui } from '../utils/i18n'
import Card from './Card'

function NewsSection({ limit = 3, showHeaderLink = true }) {
  const { content, language, text } = useContent()
  const labels = ui[language]
  const visibleNews = [...(content?.news || [])]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)

  return (
    <section className="section-pad">
      <div className="page-shell">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{labels.news}</p>
            <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
              {labels.allNews}
            </h2>
          </div>
          {showHeaderLink && (
            <Link
              to="/news"
              className="focus-ring inline-flex items-center gap-2 self-start rounded-lg border border-line/70 bg-panel/55 px-4 py-2 text-sm font-semibold text-text backdrop-blur-xl transition duration-300 hover:border-accent/40 hover:text-accent sm:self-auto"
            >
              {labels.allNews} <ArrowRight size={17} />
            </Link>
          )}
        </div>

        {visibleNews.length === 0 ? (
          <div className="glass-panel-strong rounded-[20px] p-8 text-center">
            <p className="text-xl font-semibold text-text">{labels.noNews}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{labels.noNewsText}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {visibleNews.map((item) => (
              <Card key={item.id}>
                <span className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <CalendarDays size={14} /> {formatDate(item.publishedAt, language)}
                </span>
                <h3 className="mt-5 text-xl font-semibold leading-7 text-text">
                  {text(item.title)}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted">{text(item.text)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsSection
