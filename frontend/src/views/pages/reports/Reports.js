import { cilReload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CLink,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useWebSocketRequest from '../../../hooks/useWebSocketRequest'
import { getReportList, uploadImage } from '../../../utils/fetchApi'

const ProcessStatus = () => {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const location = useLocation()
  const [arquive, _] = useState(location.state?.props?.arquive)
  // const pollingInterval = useRef(null)

  const sortReports = (array) => {
    return [...array].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // const checkPendingReports = useCallback((data) => {
  //   return data.some((report) => report.status === 'PENDING')
  // }, [])

  const handleUpdate = useCallback((data) => {
    if (typeof data === 'object' /*  && ['SUCCESS', 'PROCESSED'].includes(data.status) */) {
      getReportList()
        .then(async (res) => {
          setReports(sortReports(res))
          setLoading(false)
          // await sendReportList()
        })
        .catch(console.error)
    } else if (Array.isArray(data)) {
      setReports(sortReports(data))
      setLoading(false)
    } else {
      setReports((prev) =>
        prev.map((report) => (report.id === data.jobId ? { ...report, ...data } : report)),
      )
      setLoading(false)
    }
  }, [])

  const { execute } = useWebSocketRequest({
    type: 'job_finished',
    onSuccess: handleUpdate,
    onError: (error) => {
      console.error('WebSocket error:', error)
      setLoading(false)
    },
    autoConnect: true,
    reconnect: true,
  })

  useEffect(() => {
    getReportList()
      .then((res) => handleUpdate(res))
      .catch(console.error)
  }, [handleUpdate])

  useEffect(() => {
    if (arquive) {
      uploadImage(arquive).then((pauses) => {
        if (!pauses?.error && pauses?.data?.data?.pausas?.length > 0 && pauses.data.data.jobId) {
          execute({ jobId: pauses.data.data.jobId })
        }
      })
    }
  }, [arquive, execute])

  return (
    <CContainer>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          {'Relatórios'}
          <CButton onClick={() => window.location.reload()}>
            {'Atualizar '}
            <CIcon icon={cilReload} />
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>NOME</CTableHeaderCell>
                <CTableHeaderCell>STATUS</CTableHeaderCell>
                <CTableHeaderCell>LINHAS PROCESSADAS</CTableHeaderCell>
                <CTableHeaderCell>VERSÃO DO ARQUIVO</CTableHeaderCell>
                <CTableHeaderCell>DATA DE CRIAÇÃO</CTableHeaderCell>
                <CTableHeaderCell>VER</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {loading ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    <CSpinner color="primary" />
                  </CTableDataCell>
                </CTableRow>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <CTableRow key={report.id}>
                    <CTableDataCell>{report.file}</CTableDataCell>
                    <CTableDataCell>{report.status}</CTableDataCell>
                    <CTableDataCell>{report.savedRows}</CTableDataCell>
                    <CTableDataCell>{report.oldVersion ? 'Antiga' : 'Nova'}</CTableDataCell>
                    <CTableDataCell>
                      {moment(report.createdAt).format('DD/MM/YYYY HH:mm')}
                    </CTableDataCell>
                    <CTableDataCell>
                      {report.status === 'SUCCESS' && report.savedRows > 0 && (
                        <CLink
                          href={`/#/${report.savedRows > 0 ? 'pausas/' + report.id : 'relatorios'}`}
                        >
                          <CButton color="primary">Ver</CButton>
                        </CLink>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    Nenhum dado encontrado.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ProcessStatus
