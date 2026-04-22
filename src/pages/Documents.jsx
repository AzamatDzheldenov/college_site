import { Download, FileText } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

function Documents() {
  const { content, language, text } = useContent()
  const labels = ui[language]
  const documents = content?.documents || []

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="glass-panel rounded-[25px] p-6 sm:p-8">
          <p className="eyebrow">{labels.documents}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {language === 'ky' ? 'Ченемдик-укуктук документтер' : 'Нормативно-правовые документы'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            {language === 'ky'
              ? 'Колледждин расмий документтери, жоболору жана эрежелери.'
              : 'Официальные документы, положения и правила колледжа.'}
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="glass-panel-strong mt-8 rounded-[20px] p-8 text-center">
            <p className="text-xl font-semibold text-text">{labels.noDocuments}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <article key={document.id} className="glass-panel-strong rounded-[20px] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/12 text-accent">
                  <FileText size={23} />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-text">{text(document.title)}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{text(document.description)}</p>
                {document.file ? (
                  <a
                    href={document.file.url}
                    className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg border border-line/70 bg-panel/60 px-4 py-2 text-sm font-semibold text-text transition hover:border-accent/40 hover:text-accent"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {labels.readDocuments} <Download size={16} />
                  </a>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    {language === 'ky' ? 'Файл азырынча тиркелген эмес.' : 'Файл пока не приложен.'}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Documents
