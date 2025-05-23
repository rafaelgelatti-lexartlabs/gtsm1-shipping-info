import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from '@coreui/react'

import { useCallback, useEffect, useState } from 'react'
import { getExcelOfLogs, getVariations } from '../../../utils/fetchApi'

const Logs = () => {
  const [variations, setVariations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getVariations()
      setVariations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [dateStart, dateEnd])

  const generateExcel = async () => {
    try {
      await getExcelOfLogs({ dateStart, dateEnd })
    } catch (err) {
      setError(err.message)
    }
  }

  const cleanFilter = async (e) => {
    e.preventDefault()
    setDateEnd('')
    setDateStart('')
    await fetchLogs()
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => {
      setLoading(false)
      setError(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [error])

  const handleFilter = (e) => {
    e.preventDefault()
    fetchLogs()
  }

  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">Variações</h5>
      </CCardHeader>

      <CCardBody>
        {/* <CForm onSubmit={handleFilter}>
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

            <CCol xs={12} sm={6} md={4} lg={3} className="d-flex align-items-end">
              <CButton size="sm" type="submit" color="primary">
                <CIcon size="sm" icon={cilFilter} /> Filtrar
              </CButton>
              <CButton
                style={{
                  border: '1px var(--cui-primary) solid',
                  color: 'var(--cui-primary)',
                }}
                size="sm"
                onClick={cleanFilter}
                className="ms-2"
              >
                <CIcon size="sm" icon={cilX} /> Limpar
              </CButton>
              <CButton
                size="sm"
                className="text-nowrap ms-2"
                color="success"
                onClick={generateExcel}
              >
                Gerar XLSX
              </CButton>
            </CCol>
          </CRow>
        </CForm> */}

        {error && <CAlert color="danger">{error}</CAlert>}

        {loading ? (
          <div className="text-center">
            <CSpinner />
          </div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Variação</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {variations.length > 0 ? (
                variations.map((variation, idx) => (
                  <CTableRow key={idx}>
                    <CTableDataCell>{variation}</CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell className="text-center">
                    Nenhuma variação encontrada
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
