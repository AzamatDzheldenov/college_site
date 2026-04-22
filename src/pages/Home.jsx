import { BriefcaseBusiness, Layers, ShieldCheck } from 'lucide-react'
import ContactsSection from '../components/ContactsSection'
import HeroSection from '../components/HeroSection'
import TestimonialsSection from '../components/TestimonialsSection'
import { useContent } from '../context/ContentContext'

const icons = [
  <Layers key="layers" size={23} />,
  <BriefcaseBusiness key="briefcase" size={23} />,
  <ShieldCheck key="shield" size={23} />,
]

function Home() {
  const { content, text } = useContent()
  const highlights = content?.staticPages?.home?.highlights || []

  return (
    <>
      <HeroSection />

      <section className="section-pad">
        <div className="page-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => (
              <div key={text(item.title)} className="glass-panel-strong rounded-[20px] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {icons[index % icons.length]}
                </span>
                <h2 className="mt-5 text-xl font-semibold text-text">{text(item.title)}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{text(item.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <ContactsSection />
    </>
  )
}

export default Home
