import { CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react'
import React from 'react'

const ProcessStatus = () => {
  return (
    <CCard>
      <CCardHeader>Status de processos</CCardHeader>
      <CCardBody>
        <CSpinner color="primary"></CSpinner>
        Em contrução...
      </CCardBody>
    </CCard>
  )
}

export default ProcessStatus
