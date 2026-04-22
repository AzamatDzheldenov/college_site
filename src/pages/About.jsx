import { CheckCircle2 } from 'lucide-react'
import { useContent } from '../context/ContentContext'

const values = {
  ru: [
    'Колледж входит в структуру Иссык-Кульского государственного университета им. К. Тыныстанова',
    'Учебный процесс связан с практикой, ПЦК и студенческими инициативами',
    'Информация о новостях, документах и составе ПЦК доступна на двух языках',
    'Адрес колледжа: г. Каракол, ул. Абдрахманова 130',
  ],
  ky: [
    'Колледж К. Тыныстанов атындагы Ысык-Көл мамлекеттик университетинин түзүмүнө кирет',
    'Окуу процесси практика, ПЦК жана студенттик демилгелер менен байланышкан',
    'Жаңылыктар, документтер жана ПЦК курамы тууралуу маалымат эки тилде жеткиликтүү',
    'Колледждин дареги: Каракол ш., Абдрахманов көч. 130',
  ],
}

function About() {
  const { language, text, content } = useContent()

  return (
    <section className="section-pad pt-36">
      <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">{language === 'ky' ? 'Колледж жөнүндө' : 'О колледже'}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {text(content?.site?.name)}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            {text(content?.contacts?.description)}
          </p>
        </div>

        <div className="glass-panel rounded-[25px] p-6 sm:p-8">
          <div className="grid gap-4">
            {values[language].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-accent" size={21} />
                <p className="text-base leading-7 text-text">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
