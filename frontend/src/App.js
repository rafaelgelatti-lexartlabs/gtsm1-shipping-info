import React, { Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { CSpinner, useColorModes } from '@coreui/react'
// import './scss/_custom.scss'
import './scss/style.scss'
// import './scss/stylesheet.scss'

// We use those styles to show code examples, you should remove them in your application.
// import Layout from './layout/Layout'
import './scss/examples.scss'

// Containers
// const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Layout = React.lazy(() => import('./layout/Layout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Loading = React.lazy(() => import('./views/pages/loading/Loading'))
// const Pausas = React.lazy(() => import('./views/pages/pausas/Pausas'))
// const ProcessStatus = React.lazy(() => import('./views/pages/reports/Reports'))
// const Indicadores = React.lazy(() => import('./views/pages/indicadores/Indicadores'))
// const UserList = React.lazy(() => import('./views/pages/UserList/UserList'))
// const StatusProcessos = React.lazy(() => import('./views/pages/processStatus/ProcessStatus'))
const UploadPausa = React.lazy(() => import('./views/pages/upload_pausa/Upload_pausa'))
const ImportPessoas = React.lazy(() => import('./views/pages/import_pessoas/Import_pessoas'))
// const NavHeaderLoader = React.lazy(() => import('./views/pages/loading/NavHeaderLoader'))
const Variations = React.lazy(() => import('./views/pages/variations/Variations'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    // const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    const theme = sessionStorage.getItem('coreui-free-react-admin-template-theme')
    if (theme) {
      setColorMode(theme)
    } else {
      setColorMode('light')
      sessionStorage.setItem('coreui-free-react-admin-template-theme', 'light')
    }
    // setColorMode('light')

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/loading/*" name="Loading" element={<Loading />} />
          <Route element={<Layout />}>
            <Route exact path="/upload-pausa" name="Upload Pausa" element={<UploadPausa />} />
            <Route
              exact
              path="/import-variacoes"
              name="Importar Pessoas"
              element={<ImportPessoas />}
            />
            {/* <Route exact path="/pausas/:id" name="Pausas" element={<Pausas />} /> */}
            {/* <Route exact path="/indicadores" name="Indicadores" element={<Indicadores />} /> */}
            {/* <Route exact path="/relatorios" name="Relatorios" element={<Pausas />} /> */}
            {/* <Route exact path="/processos" name="Processos" element={<ProcessStatus />} /> */}
            {/* <Route exact path="/user-list" name="Lista de usuários" element={<UserList />} /> */}
            {/* <Route exact path="/carregando" name="Carregando" element={<NavHeaderLoader />} /> */}
            <Route exact path="/variations" name="Variations" element={<Variations />} />
          </Route>
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<Login />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
