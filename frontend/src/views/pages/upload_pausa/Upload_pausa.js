import { cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getPdfExampleReport, uploadImage } from '../../../utils/fetchApi'
import InputJBS from '../../components/atoms/InputJBS'

const Upload_pausa = () => {
  const [form, setForm] = useState({
    arquivo: null,
  })
  const [msg, setMsg] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notNow, setNotNow] = useState(true)
  const [filename, setFilename] = useState(false)
  const [oldVersion, setOldVersion] = useState(false)
  const [visibleTooltip, setVisibleTooltip] = useState(false)
  const oldVersionRef = useRef(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const handleCheck = (e) => {
    setOldVersion(e.target.checked)
  }

  const linkExamplePeople = async (version = false) => {
    return await getPdfExampleReport({ oldVersion: version })
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target

    const nm = Array.from(files)
      .map((file) => file.name)
      .join(', ')

    setFilename(nm)

    if (name === 'arquivo') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          handleClear()
          setLoading(true)
          const msg = 'Tipo de arquivo não suportado. Use JPG, JPEG, PNG ou PDF.'
          console.error(msg)
          setMsg({ message: msg, color: 'danger' })
          return
        }
      }
      setForm({
        ...form,
        [name]: Array.from(files),
      })

      if (nm === '' && (files.length <= 0 || !files)) {
        setNotNow(true)
      } else {
        setNotNow(false)
      }
    } else {
      setForm({
        ...form,
        [name]: value,
      })
    }
  }

  const handleClear = () => {
    setForm({
      arquivo: null,
    })
    setOldVersion(false)
    setMsg(false)
    setNotNow(true)
    setFilename(false)
  }

  const handleUpload = async () => {
    setShowConfirmationModal(false)
    try {
      setLoading(true)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

      for (const file of form.arquivo) {
        if (!allowedTypes.includes(file.type)) {
          handleClear()
          const msg = 'Tipo de arquivo não suportado. Use JPG, JPEG, PNG ou PDF.'
          console.error(msg)
          setMsg({ message: msg, color: 'danger' })
          return
        }
      }

      const res = await uploadImage(form.arquivo, oldVersion)

      if (!res?.error && res?.message === 'Success') {
        navigate('/processos')
      } else {
        handleClear()
        setMsg({ message: res.message, color: 'danger' })
      }
    } catch (error) {
      console.error(error)
      setMsg({ message: 'Servidor está ocupado!', color: 'danger' })
      setForm({ arquivo: null })
      setNotNow(true)
      setFilename(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowConfirmationModal(true)

    // try {
    //   setLoading(true)
    //   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

    //   for (const file of form.arquivo) {
    //     if (!allowedTypes.includes(file.type)) {
    //       handleClear()
    //       // setLoading(true)
    //       const msg = 'Tipo de arquivo não suportado. Use JPG, JPEG, PNG ou PDF.'
    //       console.error(msg)
    //       setMsg({ message: msg, color: 'danger' })
    //       return
    //     }
    //   }

    //   const res = await uploadImage(form.arquivo, oldVersion)

    //   if (!res?.error && res?.message === 'Success') {
    //     navigate(
    //       '/processos' /* `/carregando`, {
    //         state: {
    //           route: '/processos',
    //           arquivos: form.arquivo,
    //           anterior: '/upload_pausa',
    //         },
    //       } */,
    //     )
    //     // navigate(route)
    //   } else {
    //     handleClear()
    //     setMsg({ message: res.message, color: 'danger' })
    //   }
    // } catch (error) {
    //   console.error(error)

    //   setMsg({ message: 'Servidor está ocupado!', color: 'danger' })
    //   setForm({ arquivo: null })
    //   setNotNow(true)
    //   setFilename(false)
    // }
  }

  useEffect(() => {
    if (msg === false) return
    setTimeout(() => {
      setLoading(false)
      setMsg(false)
    }, 3000)
  }, [msg])

  useEffect(() => {
    handleClear()
  }, [])

  const sheetVersionText = useMemo(() => {
    const t = oldVersion ? 'antiga' : 'nova'
    return (
      <p>
        {`Você escolheu versão de planilha `}
        <span style={{ fontWeight: '900' }}>{t}</span>
        {`. Deseja proseguir?`}
      </p>
    )
  }, [oldVersion])

  return (
    <>
      {msg && <CAlert color={msg.color}>{msg.message}</CAlert>}
      <CModal visible={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
        <CModalHeader closeButton>Confirmação de Versão</CModalHeader>
        <CModalBody>{sheetVersionText}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmationModal(false)}>
            Não
          </CButton>
          <CButton color="primary" onClick={handleUpload}>
            Sim
          </CButton>
        </CModalFooter>
      </CModal>
      <CCard>
        <CCardHeader>Importador Planilha de Pausa</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Linha 3: Ano e Upload de Arquivo */}
            <CRow className="">
              <CCol md={6}>
                <CFormLabel htmlFor="arquivo">Upload do Arquivo</CFormLabel>
                <InputJBS className="mb-2" name={filename} handleChange={handleChange} />
                {/* <CFormCheck
                  id="flexCheckDefault"
                  label="Versão antiga do arquivo?"
                  name="oldVersion"
                  checked={oldVersion}
                  onChange={handleCheck}
                ></CFormCheck> */}
                <CCol className="flex-nowrap row form-check d-flex align-items-center" md={12}>
                  <div style={{ alignContent: 'center', width: 'auto', paddingRight: '0px' }}>
                    <input
                      id="flexCheckDefault"
                      label="Versão antiga do arquivo?"
                      name="oldVersion"
                      checked={oldVersion}
                      onChange={handleCheck}
                      className="form-check-input"
                      type="checkbox"
                      ref={oldVersionRef}
                    ></input>
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                      <small>{'Versão antiga do arquivo?'}</small>
                    </label>
                  </div>
                  {/* </div> */}
                  <div style={{ width: 'auto', paddingLeft: '0px' }}>
                    <CTooltip
                      trigger={['click']}
                      style={{ width: 'auto' }}
                      visible={visibleTooltip}
                      onShow={() => {
                        if (!visibleTooltip) {
                          setVisibleTooltip(true)
                        }
                      }}
                      content={
                        <div>
                          <p>Versão de 2025 ou superior</p>
                          <CLink
                            component="button"
                            onClick={() => linkExamplePeople()}
                            className="p-0"
                            style={{
                              cursor: 'pointer',
                            }}
                          >
                            Exemplo de nova versão do relatório
                            {/* Exemplo de nova versão do relatório */}
                          </CLink>
                          <br />
                          <br />
                          <p>Versão de 2024 ou inferior</p>
                          <CLink
                            component="button"
                            onClick={() => linkExamplePeople(true)}
                            className="p-0"
                            style={{
                              cursor: 'pointer',
                            }}
                          >
                            Exemplo de antiga versão do relatório
                            {/* Exemplo de antiga versão do relatório */}
                          </CLink>
                        </div>
                      }
                      placement="right"
                      // interactive=""
                    >
                      <CButton color="light" size="sm" variant="ghost">
                        <CIcon icon={cilInfo} className="text-primary" />
                      </CButton>
                    </CTooltip>
                  </div>
                </CCol>
              </CCol>
            </CRow>

            {/* Botões Enviar e Limpar */}
            <div className="mt-2">
              <CButton type="submit" color="primary" className="me-2" disabled={loading || notNow}>
                {loading ? (
                  <>
                    <CSpinner as="span" className="me-2" size="sm" aria-hidden="true" />
                    <span role="status">Carregando...</span>
                  </>
                ) : (
                  'Enviar'
                )}
              </CButton>
              <CButton
                type="reset"
                // color="secondary"
                // style={{ color: 'var(--color-light-gray-blue)' }}
                onClick={handleClear}
                disabled={loading}
              >
                Cancelar
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Upload_pausa
