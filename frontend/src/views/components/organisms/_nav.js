import { CNavItem } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export const getNavItems = (userType, hasPauseInSession) => {
  const navigate = useNavigate()
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(String(userType).toUpperCase())
  const mobilePX = 991
  return [
    // {
    //   component: CNavItem,
    //   name: 'Dashboard',
    //   to: '/',
    // },
    {
      component: CNavItem,
      name: 'Importador Planilha de Pausa',
      to: '/upload-pausa',
      className: 'text-wrap',
      onClick: () => {
        if (window.innerWidth <= mobilePX) {
          navigate('/upload-pausa')
          window.location.reload()
        }
      },
    },
    ...(isAdmin
      ? [
        {
          component: CNavItem,
          name: 'Importador Planilha de Colaboradores',
          to: '/import-pessoas',
          className: 'text-wrap',
          onClick: () => {
            if (window.innerWidth <= mobilePX) {
              navigate('/import-pessoas')
              window.location.reload()
            }
          },
        },
      ]
      : []),
    ...(hasPauseInSession
      ? [
        {
          component: CNavItem,
          name: 'Relatórios',
          to: '/relatorios',
          style:
            window.location.hash.split('/').at(1) === 'relatorios' ||
              window.location.hash.split('/').at(1) === 'pausas'
              ? { backgroundColor: 'var(--cui-tertiary-bg)', color: 'var(--cui-primary)' }
              : {},
          onClick: () => {
            if (window.location.hash !== '#/relatorios') {
              navigate('/relatorios')
              window.location.reload()
            }
          },
        },
      ]
      : []),
    {
      component: CNavItem,
      name: 'Status de processos',
      to: '/processos',
      onClick: () => {
        if (window.innerWidth <= mobilePX) {
          navigate('/processos')
          window.location.reload()
        }
      },
    },
    ...(isAdmin
      ? [
        {
          component: CNavItem,
          name: 'Lista de usuários',
          to: '/user-list',
          onClick: () => {
            if (window.innerWidth <= mobilePX) {
              navigate('/user-list')
              window.location.reload()
            }
          },
        },
      ]
      : []),
    ...(isAdmin
      ? [
        {
          component: CNavItem,
          name: 'Logs',
          to: '/logs',
          onClick: () => {
            if (window.innerWidth <= mobilePX) {
              navigate('/logs')
              window.location.reload()
            }
          },
        },
      ]
      : []),
    // {
    //   component: CNavItem,
    //   name: 'Indicadores',
    //   to: '/indicadores',
    // },
  ]
}
