export const ui = {
  ru: {
    home: 'Главная',
    about: 'О колледже',
    applicants: 'Абитуриентам',
    students: 'Студентам',
    documents: 'Документы',
    gallery: 'Галерея',
    news: 'Новости',
    contacts: 'Контакты',
    pck: 'Состав ПЦК',
    allNews: 'Все новости',
    noNews: 'Новостей пока нет',
    noNewsText: 'Когда администратор добавит новости, они появятся в этом разделе.',
    readDocuments: 'Открыть документ',
    noDocuments: 'Документы пока не загружены',
    galleryTitle: 'Жизнь колледжа',
    noGallery: 'Фотографии пока не опубликованы',
    teachers: 'Преподаватели',
    noTeachers: 'Состав этого ПЦК пока не заполнен.',
    contactsTitle: 'Мы рядом, если нужен быстрый ответ',
    phone: 'Телефон',
    whatsapp: 'Whatsapp',
    email: 'Почта',
    address: 'Адрес',
  },
  ky: {
    home: 'Башкы бет',
    about: 'Колледж жөнүндө',
    applicants: 'Абитуриенттерге',
    students: 'Студенттерге',
    documents: 'Документтер',
    gallery: 'Галерея',
    news: 'Жаңылыктар',
    contacts: 'Байланыш',
    pck: 'ПЦК курамы',
    allNews: 'Бардык жаңылыктар',
    noNews: 'Азырынча жаңылык жок',
    noNewsText: 'Администратор жаңылык кошкондо, ал ушул бөлүмдө пайда болот.',
    readDocuments: 'Документти ачуу',
    noDocuments: 'Документтер азырынча жүктөлө элек',
    galleryTitle: 'Колледж жашоосу',
    noGallery: 'Сүрөттөр азырынча жарыяланган жок',
    teachers: 'Окутуучулар',
    noTeachers: 'Бул ПЦКнын курамы азырынча толтурула элек.',
    contactsTitle: 'Сурооңуз болсо, биз байланыштабыз',
    phone: 'Телефон',
    whatsapp: 'Whatsapp',
    email: 'Почта',
    address: 'Дарек',
  },
}

export function formatDate(date, language) {
  const value = new Date(date)

  if (Number.isNaN(value.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(language === 'ky' ? 'ky-KG' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)
}
