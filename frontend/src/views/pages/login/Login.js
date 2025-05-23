import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
// import Logo from '../../../assets/brand/logo/RGB/SVG/logo.svg?react'
// import { ReCaptchaComponent } from '../../../components'
import '../../../scss/views/pages/Login/Login.scss'
import { loginApi } from '../../../utils/fetchApi'
import { saveAccessTokenInStorage, saveDataInStorage } from '../../../utils/localstorage'

const Login = () => {
  // const [recaptchaToken, setRecaptchaToken] = useState()
  // const [refreshReCaptcha, setRefreshReCaptcha] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // setRefreshReCaptcha((r) => !r)

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    // if (!recaptchaToken) {
    //   setError('Erro ReCaptcha.')
    //   return
    // }

    try {
      const user = await loginApi({
        username,
        password,
        // recaptchaToken,
      })


      if (user?.token) {
        saveAccessTokenInStorage(user.token)
        saveDataInStorage('user', user.user)
        dispatch({ type: 'set', user: user.user })
        setError(false)
        navigate('/import-variacoes')
      } else {
        setError(`Credenciais inválidas.`)
      }
    } catch (error) {
      setError('Erro: Servidor está ocupado!')
    }
  }

  return (
    <div id="login-page" className="min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CRow className="justify-content-center">
            </CRow>
            <CCardGroup>
              <CCard className="p-4" /* style={{ backgroundColor: 'var(--color-deep-blue)' }} */>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Entre na sua conta</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Usuário"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={<CIcon icon={cilLockLocked} />}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          type="submit"
                          color="primary"
                          className="px-4"
                        // disabled={!recaptchaToken}
                        >
                          Login
                        </CButton>
                      </CCol>
                      {/* <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol> */}
                    </CRow>
                    <CRow>
                      {/* <ReCaptchaComponent
                        // action={setRecaptchaToken}
                        onVerify={setRecaptchaToken}
                        refreshReCaptcha={refreshReCaptcha}
                      /> */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {/* <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard> */}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
