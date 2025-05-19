import { cilFilter, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
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
import { getExcelOfLogs, getLogs } from '../../../utils/fetchApi'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const fetchLogs = useCallback(
    async (isClean = false) => {
      try {
        setLoading(true)
        setError(null)
        const data = await getLogs(isClean ? {} : { dateStart, dateEnd })
        console.log(data)
        if (data?.response?.data === 'Invalid token') {
          setError(data.response.data)
          return
        }

        // console.log(
        //   moment(
        //     new Date(data[0].createdAt).toISOString(),
        //     moment.HTML5_FMT.DATETIME_LOCAL_MS,
        //   ).format('YYYY-MM-DD HH:mm:ss'),
        //   '¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨',
        // )

        setLogs(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [dateStart, dateEnd],
  )

  const genenrateExcel = async () => {
    try {
      await getExcelOfLogs({ dateStart, dateEnd })
    } catch (err) {
      setError(err.message)
    }
  }

  const cleanFilterPauses = async (e) => {
    e.preventDefault()
    setDateEnd('')
    setDateStart('')
    await fetchLogs(true)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (!error) return
    setTimeout(() => {
      setLoading(false)
      setError(false)
    }, 3000)
  }, [error])

  const handleFilter = (e) => {
    e.preventDefault()
    fetchLogs()
  }

  const columns = [
    { key: 'createdAt', label: 'Data/Hora' },
    { key: 'username', label: 'Usuário' },
    { key: 'email', label: 'Email' },
    { key: 'unidad', label: 'Unidade' },
    { key: 'operation', label: 'Operação' },
    { key: 'resource', label: 'Tabela do banco de dados' },
    { key: 'resourceId', label: 'ID Recurso' },
  ]

  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">Registros de Logs</h5>
      </CCardHeader>

      <CCardBody>
        <CForm onSubmit={handleFilter}>
          <CRow className="g-3 mb-4">
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Data inicial"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </CCol>

            <CCol md={3}>
              <CFormInput
                type="date"
                label="Data final"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </CCol>

            <CCol xs={12} sm={6} md={4} lg={3} className="d-flex align-items-end w-auto">
              <CButton size="sm" type="submit" /* className="d-flex flex-nowrap" */ color="primary">
                <CIcon size="sm" icon={cilFilter} /> Filtrar
              </CButton>
              <CButton
                style={{
                  border: '1px var(--cui-primary) solid',
                  color: 'var(--cui-primary)',
                }}
                size="sm"
                onClick={cleanFilterPauses}
                // disabled={!canClean || !hasFilters}
                className="ms-2"
              >
                <CIcon size="sm" icon={cilX} /> Limpar
              </CButton>
              <CButton
                size="sm"
                className="text-nowrap ms-2"
                color="success"
                onClick={genenrateExcel}
              >
                Gerar XLSX
              </CButton>
            </CCol>
          </CRow>
        </CForm>

        {error && <CAlert color="danger">{error}</CAlert>}

        {loading ? (
          <div className="text-center">
            <CSpinner />
          </div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                {columns.map((column) => (
                  <CTableHeaderCell key={column.key}>{column.label}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {logs.map((log) => (
                <CTableRow key={log.id}>
                  <CTableDataCell>
                    {moment(
                      new Date(log.createdAt).toISOString(),
                      moment.HTML5_FMT.DATETIME_LOCAL_MS,
                    ).format('DD/MM/YYYY')}
                  </CTableDataCell>
                  <CTableDataCell>{log?.username || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{log?.user?.email || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{log?.user?.unidad}</CTableDataCell>
                  <CTableDataCell>{log?.operation}</CTableDataCell>
                  <CTableDataCell>{log?.resource || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{log?.resourceId || 'N/A'}</CTableDataCell>
                </CTableRow>
              ))}

              {logs.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center">
                    Nenhum registro encontrado
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Logs
