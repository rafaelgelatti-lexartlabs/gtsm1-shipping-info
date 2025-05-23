import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CRow,
  CSpinner
} from '@coreui/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkUser, getExcelExamplePeople, uploadPlanilha } from '../../../utils/fetchApi'
import { getDataInStorage } from '../../../utils/localstorage'
import InputJBS from '../../components/atoms/InputJBS'

const Importar_pessoas = () => {
  const [form, setForm] = useState({
    arquivo: null,
  })
  const [msg, setMsg] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notNow, setNotNow] = useState(true)
  const [filename, setFilename] = useState(false)
  const [visibleTooltip, setVisibleTooltip] = useState(false)
  const fileInputRef = useRef(null)
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ]
  const errorMsg = 'Tipo de arquivo não suportado. Use XLSX e CSV.'

  const navigate = useNavigate()

  const linkExamplePeople = async () => {
    const exampleExcel = await getExcelExamplePeople()
    return exampleExcel
  }

  const handleChange = (e) => {
    if (visibleTooltip) {
      setVisibleTooltip(false)
    }
    const { name, value, files } = e.target

    const nm = Array.from(files)
      .map((file) => file.name)
      .join(', ')

    setFilename(nm)

    if (name === 'arquivo') {
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          handleClear()
          setLoading(true)
          const msg = errorMsg
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
    if (visibleTooltip) {
      setVisibleTooltip(false)
    }
    setForm({
      arquivo: null,
    })
    setMsg(false)
    setNotNow(true)
    setFilename(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    if (visibleTooltip) {
      setVisibleTooltip(false)
    }
    e.preventDefault()

    try {
      setLoading(true)

      for (const file of form.arquivo) {
        if (!allowedTypes.includes(file.type)) {
          handleClear()
          const msg = errorMsg
          console.error(msg)
          setMsg({ message: msg, color: 'danger' })
          return
        }
      }

      const uploadSheet = await uploadPlanilha(form.arquivo[0])
      if (uploadSheet.error) {
        setMsg({ message: uploadSheet.message, color: 'danger' })
        setLoading(false)
        return
      }

      handleClear()
      setMsg({ message: 'Variações atualizadas com sucesso!', color: 'success' })
      setLoading(false)
    } catch (error) {
      console.error(error)

      setMsg({ message: 'Servidor está ocupado!', color: 'danger' })
      setForm({ arquivo: null })
      setNotNow(true)
      setFilename(false)
    }
  }

  const check = async () => {
    const serverUser = await checkUser()

    const actualUser = getDataInStorage('user')

    actualUser.password = undefined
    serverUser.password = undefined

    // if (JSON.stringify(actualUser) !== JSON.stringify(serverUser)) {
    //   saveDataInStorage('user', serverUser)
    //   if (!['ADMIN', 'SUPER_ADMIN'].includes(serverUser.type)) {
    //     return navigate('/upload-pausa')
    //   }
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
    check()
  }, [])

  return (
    <>
      {msg && <CAlert color={msg.color}>{msg.message}</CAlert>}
      <CCard>
        <CCardHeader>Importar Planilha de Variações</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Linha 3: Ano e Upload de Arquivo */}
            <CRow className="mb-2">
              <CCol md={6}>
                <CFormLabel htmlFor="arquivo">Upload do Arquivo</CFormLabel>
                <InputJBS
                  reference={fileInputRef}
                  name={filename}
                  handleChange={handleChange}
                  accept=""
                  placeholder="Escolher arquivo"
                  acceptInput={`${allowedTypes}`}
                  multipleInputs={false}
                />
              </CCol>
            </CRow>
            {/* <div className="d-flex align-items-center">
              <small>Visualização da Planilha</small>
              <CTooltip
                trigger={['click']}
                visible={visibleTooltip}
                onShow={() => {
                  if (!visibleTooltip) {
                    setVisibleTooltip(true)
                  }
                }}
                content={
                  <div>
                    <p>As colunas devem seguir exatamente a estrutura do exemplo:</p>
                    <ul className="mb-3" style={{ paddingLeft: '1rem' }}>
                      <li>Ordem das colunas deve ser mantida</li>
                      <li>Nomes de cabeçalho devem ser idênticos</li>
                    </ul>
                    <CLink
                      component="button"
                      onClick={linkExamplePeople}
                      className="p-0"
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      Clique para ver o exemplo completo
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
            </div> */}

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
              <CButton type="reset" onClick={handleClear} disabled={loading}>
                Cancelar
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}
export default Importar_pessoas
