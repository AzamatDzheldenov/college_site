import { useContent } from '../context/ContentContext'

function LanguageToggle() {
  const { language, setLanguage } = useContent()

  return (
    <div className="inline-flex h-11 rounded-lg border border-line/60 bg-panel/60 p-1 shadow-soft backdrop-blur-xl">
      {[
        ['ru', 'RU'],
        ['ky', 'KG'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          className={[
            'focus-ring rounded-lg px-3 text-xs font-bold transition duration-300',
            language === value
              ? 'bg-accent text-white'
              : 'text-muted hover:bg-accent/10 hover:text-accent',
          ].join(' ')}
          aria-label={value === 'ru' ? 'Русский язык' : 'Кыргыз тили'}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle
