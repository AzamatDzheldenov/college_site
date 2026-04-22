import { UserRound } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

function Pck() {
  const { slug } = useParams()
  const { content, isLoading, language, text } = useContent()
  const labels = ui[language]
  const direction = content?.pckDirections?.find((item) => item.slug === slug)
  const pck = content?.pckTeachers?.find((item) => item.slug === slug)
  const teachers = pck?.teachers || []

  if (!isLoading && !direction) {
    return <Navigate to="/" replace />
  }

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="glass-panel rounded-[25px] p-6 sm:p-8">
          <p className="eyebrow">{labels.pck}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {text(direction?.title)}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            {text(direction?.description)}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-text">{labels.teachers}</h2>
          {teachers.length === 0 ? (
            <div className="glass-panel-strong mt-5 rounded-[20px] p-8 text-center">
              <p className="text-muted">{labels.noTeachers}</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <article
                  key={`${text(teacher.fullName)}-${text(teacher.position)}`}
                  className="glass-panel-strong overflow-hidden rounded-[20px]"
                >
                  {teacher.photo ? (
                    <img
                      src={teacher.photo.url}
                      alt={text(teacher.fullName)}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-accent/10 text-accent">
                      <UserRound size={54} />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text">{text(teacher.fullName)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{text(teacher.position)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Pck
