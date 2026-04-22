import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation, useOutlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'

const MotionPage = motion.div

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(8px)' },
}

function MainLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="min-h-screen bg-mesh-light text-text transition-colors duration-500 dark:bg-mesh-dark">
      <Header />
      <main>
        <AnimatePresence mode="wait">
          <MotionPage
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet || <Outlet />}
          </MotionPage>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
