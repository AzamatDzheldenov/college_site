import { CalendarCheck, FileText, Images, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

const services = {
  ru: [
    ['Расписание и учебный процесс', 'Следите за объявлениями, документами и актуальной информацией колледжа.'],
    ['Документы', 'Нормативно-правовые документы доступны в отдельном разделе сайта.'],
    ['Галерея', 'Фотографии жизни колледжа, событий и учебных мероприятий.'],
    ['ПЦК', 'Состав преподавателей по каждому направлению ПЦК.'],
  ],
  ky: [
    ['Жадыбал жана окуу процесси', 'Колледждин жарыяларын, документтерин жана актуалдуу маалыматтарын караңыз.'],
    ['Документтер', 'Ченемдик-укуктук документтер сайттын өзүнчө бөлүмүндө жеткиликтүү.'],
    ['Галерея', 'Колледж жашоосу, окуялар жана окуу иш-чараларынын сүрөттөрү.'],
    ['ПЦК', 'Ар бир ПЦК багыты боюнча окутуучулар курамы.'],
  ],
}

const icons = [
  <CalendarCheck key="calendar" size={23} />,
  <FileText key="file" size={23} />,
  <Images key="images" size={23} />,
  <Users key="users" size={23} />,
]

function Students() {
  const { language } = useContent()
  const labels = ui[language]

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">{labels.students}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {language === 'ky' ? 'Студенттер үчүн маалымат' : 'Информация для студентов'}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            {language === 'ky'
              ? 'Сайт студенттерге жаңылыктарды, документтерди жана колледж жашоосун тез табууга жардам берет.'
              : 'Сайт помогает студентам быстро находить новости, документы и материалы о жизни колледжа.'}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {services[language].map(([title, description], index) => (
            <Link key={title} to={index === 1 ? '/documents' : index === 2 ? '/gallery' : '/news'} className="glass-panel-strong rounded-[20px] p-6 transition hover:-translate-y-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/12 text-accent">
                {icons[index]}
              </span>
              <h2 className="mt-5 text-xl font-semibold text-text">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Students
