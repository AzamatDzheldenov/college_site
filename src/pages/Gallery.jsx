import { Image } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { formatDate, ui } from '../utils/i18n'

function Gallery() {
  const { content, language, text } = useContent()
  const labels = ui[language]
  const gallery = [...(content?.gallery || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="glass-panel rounded-[25px] p-6 sm:p-8">
          <p className="eyebrow">{labels.gallery}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {labels.galleryTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            {language === 'ky'
              ? 'Колледждеги окуялардын, сабактардын жана студенттик демилгелердин сүрөттөрү.'
              : 'Фотографии событий, занятий и студенческих инициатив колледжа.'}
          </p>
        </div>

        {gallery.length === 0 ? (
          <div className="glass-panel-strong mt-8 rounded-[20px] p-8 text-center">
            <Image className="mx-auto text-accent" size={36} />
            <p className="mt-4 text-xl font-semibold text-text">{labels.noGallery}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <article key={item.id} className="glass-panel-strong overflow-hidden rounded-[20px]">
                <img
                  src={item.photo?.url}
                  alt={text(item.caption)}
                  className="h-72 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-lg font-semibold text-text">{text(item.caption)}</p>
                  <p className="mt-2 text-sm text-muted">{formatDate(item.createdAt, language)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
