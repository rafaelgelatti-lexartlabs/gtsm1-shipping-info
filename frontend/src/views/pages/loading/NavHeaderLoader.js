import { CContainer, CSpinner } from '@coreui/react'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { uploadImage } from '../../../utils/fetchApi'

const NavHeaderLoader = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { route = '/404', arquivos, anterior } = location.state || {}

  useEffect(() => {
    const uploadFile = async () => {
      try {
        const res = await uploadImage(arquivos)

        if (!res?.error && res?.message === 'Success') {
          navigate(route)
        } else {
          return navigate(anterior)
        }
      } catch (err) {
        console.error(err)
        navigate(anterior)
      }
    }

    console.log('chega aqui??')

    if (arquivos) {
      uploadFile()
    } else {
      navigate(route)
    }
  }, [navigate, route, arquivos])

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <CSpinner color="primary" />
      <span className="ms-2">Carregando...</span>
    </CContainer>
  )
}

export default NavHeaderLoader
