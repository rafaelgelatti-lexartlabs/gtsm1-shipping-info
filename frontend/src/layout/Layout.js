import { CRow } from '@coreui/react'
import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppHeader from '../views/components/organisms/AppHeader'
// import { AppHeader } from '../components'
import Sidebar from '../views/components/organisms/Sidebar'

const Layout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleUnauthorized = (event) => {
      navigate('/')
    }

    window.addEventListener('unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized)
    }
  }, [navigate])

  return (
    <div>
      <Sidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <CRow className="wrapper d-flex flex-column min-vh-100 px-4 pe-0">
          <Outlet />
        </CRow>
      </div>
    </div>
  )
}

export default Layout
