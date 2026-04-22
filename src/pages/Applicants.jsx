import { yupResolver } from '@hookform/resolvers/yup'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useContent } from '../context/ContentContext'
import axiosInstance from '../utils/axiosInstance'

const schema = yup.object({
  name: yup.string().trim().min(2, 'Введите имя полностью').required('Имя обязательно'),
  phone: yup
    .string()
    .trim()
    .matches(/^[+()\d\s-]{10,20}$/, 'Введите корректный телефон')
    .required('Телефон обязателен'),
  email: yup.string().trim().email('Введите корректную почту').required('Почта обязательна'),
  program: yup.string().required('Выберите программу'),
  message: yup.string().trim().max(500, 'До 500 символов'),
})

const programs = [
  'Информационные системы',
  'Экономика и бухгалтерский учет',
  'Дизайн цифровых продуктов',
  'Туризм и гостеприимство',
]

function Applicants() {
  const { language } = useContent()
  const [status, setStatus] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      program: '',
      message: '',
    },
  })

  const onSubmit = async (data) => {
    setStatus(null)

    try {
      await axiosInstance.post('/applications', data)
      setStatus({
        type: 'success',
        text:
          language === 'ky'
            ? 'Арыз жөнөтүлдү. Кабыл алуу комиссиясы сиз менен байланышат.'
            : 'Заявка отправлена. Приемная комиссия свяжется с вами.',
      })
      reset()
    } catch {
      setStatus({
        type: 'error',
        text:
          language === 'ky'
            ? 'Арызды жөнөтүү мүмкүн болгон жок. Кийинчерээк кайра аракет кылыңыз.'
            : 'Не удалось отправить заявку. Попробуйте еще раз позже.',
      })
    }
  }

  return (
    <section className="section-pad pt-36">
      <div className="page-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">{language === 'ky' ? 'Абитуриенттерге' : 'Абитуриентам'}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text sm:text-5xl">
            {language === 'ky' ? 'Багытты тандап, арыз калтырыңыз' : 'Выберите программу и оставьте заявку'}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            {language === 'ky'
              ? 'Кабыл алуу, документтер жана окуу багыттары боюнча суроолорго жооп беребиз.'
              : 'Мы поможем разобраться с документами, сроками и вступительными шагами.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-[25px] p-5 sm:p-7" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={language === 'ky' ? 'Аты-жөнү' : 'Имя'}
              error={errors.name?.message}
              input={<input {...register('name')} className="field-input" placeholder="Анна Иванова" />}
            />
            <Field
              label={language === 'ky' ? 'Телефон' : 'Телефон'}
              error={errors.phone?.message}
              input={<input {...register('phone')} className="field-input" placeholder="+996 700 000 000" />}
            />
            <Field
              label={language === 'ky' ? 'Почта' : 'Почта'}
              error={errors.email?.message}
              input={
                <input
                  {...register('email')}
                  className="field-input"
                  placeholder="mail@example.com"
                  type="email"
                />
              }
            />
            <Field
              label={language === 'ky' ? 'Багыт' : 'Программа'}
              error={errors.program?.message}
              input={
                <select {...register('program')} className="field-input">
                  <option value="">{language === 'ky' ? 'Багытты тандаңыз' : 'Выберите направление'}</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              }
            />
          </div>

          <div className="mt-5">
            <Field
              label={language === 'ky' ? 'Комментарий' : 'Комментарий'}
              error={errors.message?.message}
              input={
                <textarea
                  {...register('message')}
                  className="field-input min-h-32 resize-y"
                  placeholder={language === 'ky' ? 'Сурооңузду жазыңыз' : 'Расскажите, что хотите уточнить'}
                />
              }
            />
          </div>

          {status && (
            <p
              className={[
                'mt-5 rounded-lg px-4 py-3 text-sm font-medium',
                status.type === 'success' ? 'bg-accent/12 text-accent' : 'bg-coral/12 text-coral',
              ].join(' ')}
            >
              {status.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting
              ? language === 'ky'
                ? 'Жөнөтүлүүдө...'
                : 'Отправляем...'
              : language === 'ky'
                ? 'Арыз жөнөтүү'
                : 'Отправить заявку'}
            <Send size={17} />
          </button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, input, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
      {input}
      {error && <span className="mt-2 block text-xs text-coral">{error}</span>}
    </label>
  )
}

export default Applicants
