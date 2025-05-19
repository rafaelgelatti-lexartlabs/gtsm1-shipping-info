import { CCloseButton, CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav } from '@coreui/react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
// import LogoDark from '../../../assets/brand/logo/RGB/SVG/Dark.svg?react'
// import Logo from '../../../assets/brand/logo/RGB/SVG/logo.svg?react'
import { AppSidebarNav } from '../../../components/AppSidebarNav'
import { getDataInStorage } from '../../../utils/localstorage'
import { getNavItems } from './_nav'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigation = getNavItems(getDataInStorage('user'), true)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const storedTheme = useSelector((state) => state.theme)
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

  useEffect(() => {
    if (!getDataInStorage('user')) {
      navigate('/')
    }
  }, [])

  return (
    <CSidebar
      className="border-end border-start border-bottom"
      colorScheme="light"
      position="fixed"
      unfoldable={false}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom p-1">
        <CSidebarBrand to="/">
          {/* {{storedTheme === 'light' ? (
            // <Logo style={{ width: '100px', height: 'auto', margin: '3px' }} onClick={() => {}} />
          ) : (
            // <LogoDark
            //   style={{ width: '100px', height: 'auto', margin: '3px' }}
            //   onClick={() => {}}
            // />
          )}} */}
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <CSidebarNav>
        <AppSidebarNav items={navigation} />
      </CSidebarNav>
    </CSidebar>
  )
}

export default Sidebar
