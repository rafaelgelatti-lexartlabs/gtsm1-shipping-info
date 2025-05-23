import { cilContrast, cilMenu, cilMoon, cilSun } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
} from '@coreui/react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDataInStorage } from '../../../utils/localstorage'
import AppHeaderDropdown from './AppHeaderDropdown'
// import { AppHeaderDropdown } from '../../../components'

const AppHeader = () => {
  const [user, setUser] = useState('')
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const sidebarShow = useSelector((state) => state.sidebarShow)
  let storedUser = useSelector((state) => state.user)
  const headerRef = useRef()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) {
      if (storedUser && JSON.stringify(storedUser) !== '{}') {
        setUser(storedUser)
      } else {
        if (getDataInStorage('user') !== user) {
          setUser(getDataInStorage('user'))
          dispatch({ type: 'set', user: getDataInStorage('user') })
          storedUser = getDataInStorage('user')
        }
      }
    }
  }, [storedUser])

  useEffect(() => {
    if (!user) {
      if (storedUser) {
        setUser(storedUser)
      } else {
        if (getDataInStorage('user') !== user) {
          setUser(getDataInStorage('user'))
          dispatch({ type: 'set', user: getDataInStorage('user') })
          storedUser = getDataInStorage('user')
        }
      }
    }
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px', color: 'var(--cui-primary)' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => {
                  sessionStorage.setItem('coreui-free-react-admin-template-theme', 'light')
                  setColorMode('light')
                }}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => {
                  sessionStorage.setItem('coreui-free-react-admin-template-theme', 'dark')
                  setColorMode('dark')
                }}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => {
                  sessionStorage.setItem('coreui-free-react-admin-template-theme', 'auto')
                  setColorMode('auto')
                }}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown user={user} />
        </CHeaderNav>
      </CContainer>
      {/* <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer> */}
    </CHeader>
  )
}

export default AppHeader
