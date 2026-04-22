import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

function Footer() {
  const year = new Date().getFullYear()
  const { content, language, text } = useContent()
  const labels = ui[language]
  const contacts = content?.contacts

  return (
    <footer className="border-t border-line/60 bg-[#111827] text-slate-300">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link to="/" className="text-lg font-semibold text-white">
            {text(content?.site?.name, 'Колледж ИГУ')}
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            {text(content?.site?.tagline)}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{labels.home}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <Link className="transition hover:text-white" to="/applicants">
              {labels.applicants}
            </Link>
            <Link className="transition hover:text-white" to="/documents">
              {labels.documents}
            </Link>
            <Link className="transition hover:text-white" to="/gallery">
              {labels.gallery}
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{labels.contacts}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Phone size={16} /> {contacts?.phone}
            </span>
            <span className="flex items-center gap-2">
              <Mail size={16} /> {contacts?.email}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {text(contacts?.address)}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-700/70 py-4 text-center text-xs text-slate-500">
        © {year} {text(content?.site?.name, 'Колледж ИГУ')}
      </div>
    </footer>
  )
}

export default Footer
