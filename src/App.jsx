import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import About from './pages/About'
import Applicants from './pages/Applicants'
import Contacts from './pages/Contacts'
import Documents from './pages/Documents'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import News from './pages/News'
import Pck from './pages/Pck'
import Students from './pages/Students'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/applicants" element={<Applicants />} />
        <Route path="/students" element={<Students />} />
        <Route path="/news" element={<News />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/pck/:slug" element={<Pck />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}

export default App
