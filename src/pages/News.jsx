import { CalendarDays, PlayCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { formatDate, ui } from '../utils/i18n'

const pageSize = 6

function News() {
  const { content, language, text } = useContent()
  const [page, setPage] = useState(1)
  const labels = ui[language]
  const news = useMemo(
    () =>
      [...(content?.news || [])].sort(
        (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt),
      ),
    [content],
  )
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize))
  const visibleNews = news.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="glass-panel rounded-[25px] p-6 sm:p-8">
          <p className="eyebrow">{labels.news}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {labels.news}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            {language === 'ky'
              ? 'Колледждин эң жаңы окуялары, жарыялары жана студенттик демилгелери.'
              : 'Самые свежие события, объявления и студенческие инициативы колледжа.'}
          </p>
        </div>

        {visibleNews.length === 0 ? (
          <div className="glass-panel-strong mt-8 rounded-[20px] p-8 text-center">
            <p className="text-xl font-semibold text-text">{labels.noNews}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{labels.noNewsText}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {visibleNews.map((item) => (
              <article key={item.id} className="glass-panel-strong overflow-hidden rounded-[20px]">
                {item.photos?.length > 0 && (
                  <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {item.photos.slice(0, 3).map((photo) => (
                      <img
                        key={photo.url}
                        src={photo.url}
                        alt={text(item.title)}
                        className="h-64 w-full object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1 font-semibold text-accent">
                      <CalendarDays size={15} /> {formatDate(item.publishedAt, language)}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-text">{text(item.title)}</h2>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-muted">
                    {text(item.text)}
                  </p>

                  {item.videos?.length > 0 && (
                    <div className="mt-5 grid gap-3">
                      {item.videos.map((video) =>
                        video.type === 'external' ? (
                          <a
                            key={video.url}
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-line/70 bg-panel/60 px-4 py-3 text-sm font-semibold text-text transition hover:border-accent/40 hover:text-accent"
                          >
                            <PlayCircle size={18} /> {video.name}
                          </a>
                        ) : (
                          <video key={video.url} controls className="max-h-[520px] w-full rounded-lg">
                            <source src={video.url} type={video.mimeType} />
                          </video>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={[
                  'focus-ring h-11 min-w-11 rounded-lg px-4 text-sm font-semibold transition',
                  page === pageNumber
                    ? 'bg-accent text-white'
                    : 'glass-panel-strong text-text hover:text-accent',
                ].join(' ')}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default News
