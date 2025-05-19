import { CContainer, CSpinner } from '@coreui/react'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Loading = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { route = '/404', time = 3000, props } = location.state || {}

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!props) {
        navigate(route)
        window.location.reload()
      } else {
        navigate(route, {
          state: {
            props,
          },
        })
        window.location.reload()
      }
    }, time)

    return () => clearTimeout(timer)
  }, [navigate, route, time, props])
  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <CSpinner color="primary" /> {/* Cor do spinner (pode ser "secondary", "success", etc.) */}
      <span className="ms-2">Carregando...</span>
    </CContainer>
  )
}

export default Loading
