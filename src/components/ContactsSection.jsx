import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

function ContactsSection() {
  const { content, language, text } = useContent()
  const contacts = content?.contacts || {}
  const labels = ui[language]
  const contactItems = [
    { icon: <Phone size={21} />, label: labels.phone, value: contacts.phone },
    { icon: <MessageCircle size={21} />, label: labels.whatsapp, value: contacts.whatsapp },
    { icon: <Mail size={21} />, label: labels.email, value: contacts.email },
    { icon: <MapPin size={21} />, label: labels.address, value: text(contacts.address) },
  ]

  return (
    <section className="section-pad">
      <div className="page-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">{labels.contacts}</p>
          <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
            {labels.contactsTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            {text(contacts.description)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {contactItems.map(({ icon, label, value }) => (
            <div key={label} className="glass-panel-strong rounded-[20px] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                {icon}
              </span>
              <p className="mt-4 text-sm font-semibold text-text">{label}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactsSection
