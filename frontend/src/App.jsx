import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
import Navbar from './components/Navbar'
import { useLocation, BrowserRouter } from 'react-router-dom'

const App = () => {
  return (
    <UserProvider>
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    </UserProvider>
  )
}
const Layout = () => {
  const location = useLocation()
  const hideNavbarRoutes = ['/']
  const showNavbar = !hideNavbarRoutes.includes(location.pathname)

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950">
      {showNavbar && <Navbar />}
      <div className="flex-grow overflow-hidden">
        <AppRoutes />
      </div>

    </div>
  )
}

export default App