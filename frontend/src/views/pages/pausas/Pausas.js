/* eslint-disable react/prop-types */
import { cilCheck, cilFilter, cilMenu, cilPencil, cilPlus, cilTrash, cilX } from '@coreui/icons'

import CIcon from '@coreui/icons-react'
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPagination,
  CPaginationItem,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import CreatableSelect from 'react-select/creatable'
import {
  createReportOnExistentJobId,
  downloadEvidencesZip,
  downloadImage,
  getAllReports,
  getAllSector,
  getAllUnit,
  getExcelOfReports,
  removeReportByIds,
  updateReports,
} from '../../../utils/fetchApi'

const EDITING_SINGLE_CELL_DEFAULT = { index: null, cellField: null }

const Pausas = () => {
  const { id } = useParams()
  const [editingId, setEditingId] = useState(null)
  const [tempData, setTempData] = useState({})
  const [isEditingAll, setIsEditingAll] = useState(false)
  const [editingSingleCell, setEditingSingleCell] = useState(EDITING_SINGLE_CELL_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [newMock, setNewMock] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [pages, setPages] = useState()
  const [columnEdits, setColumnEdits] = useState({})
  const [isEditingAllColumns, setIsEditingAllColumns] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const storedTheme = useSelector((state) => state.theme)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const cuiRgb10 = { backgroundColor: 'var(--cui-danger-10-rgb)' }
  const noCpfRow = { backgroundColor: 'var(--cui-no-cpf-row-10-rgb)' }
  const refinationBgColor = { backgroundColor: 'var(--cui-refined-field)' }
  const refUnidad = useRef('')
  const refSector = useRef('')
  const refBreakType = useRef('')
  const [setor, setSetor] = useState([])
  const [unidades, setUnidades] = useState([])
  const [canClean, setCanClean] = useState(false)
  const [hasFilters, setHasFilters] = useState(false)

  const [selectedRows, setSelectedRows] = useState([])
  const [addingNewRecord, setAddingNewRecord] = useState(false)
  const [newRecord, setNewRecord] = useState({
    date: '',
    start_time: '',
    end_time: '',
    cpf: '',
    signature: '',
    unidad: '',
    sector: filteredData[19]?.sector,
    chapa: filteredData[19]?.chapa,
    break_type: filteredData?.at(-1)?.break_type.startsWith('Térmica')
      ? 'Térmica'
      : 'Psicofísiologica',
    start_activities: filteredData[0]?.start_activities,
    end_activities: filteredData[0]?.end_activities,
    position: '1',
    year: new Date().getFullYear().toString(),
  })

  // const unidades = [
  //   { value: -1, label: 'Todas as unidades' },
  //   { value: 'Lins', label: 'Lins' },
  // ]
  // const setor = [
  //   'Desossa Dianteiro',
  //   'Desossa Traseiro',
  //   'Desossa Embalagem',
  //   'Recorte Dianteiro',
  //   'Recorte Traseiro',
  // ].map((e) => ({ value: e, label: e }))
  // setor.unshift({ value: -1, label: 'Todos os setores' })

  const mockTipo = ['Térmica', 'Psicofísiologica'].map((e) => ({ value: e, label: e }))
  mockTipo.unshift({ value: -1, label: 'Todos os tipos' })

  const [filters, setFilters] = useState({
    data: '',
    dataFim: '',
    signature: '',
    name: '',
    start_time: '',
    start_time_2: '',
    end_time: '',
    end_time_2: '',
    cpf: '',
    unidad: '',
    sector: '',
    chapa: '',
    break_type: '',
    ano: '',
    start_activities: '',
    start_activities_2: '',
    end_activities: '',
    end_activities_2: '',
  })

  const generatePageRange = () => {
    const maxVisiblePages = 7
    const halfRange = 3

    if (pages?.totalPages <= maxVisiblePages) {
      return Array.from({ length: pages?.totalPages }, (_, i) => i + 1)
    }

    let startPage = Math.max(pages?.currentPage - halfRange, 1)
    let endPage = Math.min(pages?.currentPage + halfRange, pages?.totalPages)

    if (pages?.currentPage - halfRange <= 1) {
      endPage = maxVisiblePages
    } else if (pages?.currentPage + halfRange >= pages?.totalPages) {
      startPage = pages?.totalPages - maxVisiblePages + 1
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const pageRange = generatePageRange()

  const checkFilters = useCallback(() => {
    return Object.values(filters).some(
      (value) => value !== '' && value !== -1 && value !== null && value !== undefined,
    )
  }, [filters])

  const handleAddNewRecord = async () => {
    try {
      const recordToCreate = {
        ...newRecord,
        jobId: id,
        position: '1',
        year: new Date().getFullYear().toString(),
        date: moment(newRecord.date).format('DD/MM'),
        fulldate: moment(newRecord.date).format('YYYY-MM-DD'),
        evidence: filteredData[0].evidence,
      }

      await createReportOnExistentJobId(recordToCreate)
      setAddingNewRecord(false)
      setNewRecord({
        date: '',
        start_time: '',
        end_time: '',
        cpf: '',
        signature: '',
        unidad: '',
        sector: '',
        chapa: '',
        break_type: '',
        start_activities: '',
        end_activities: '',
        position: '1',
        year: new Date().getFullYear().toString(),
      })
      await filterPauses({ ...filters, page: pages.currentPage }, true)
    } catch (error) {
      console.error('Erro ao criar novo registro:', error)
    }
  }

  const handleFilterChange = (e, name) => {
    if (name) {
      return setFilters({
        ...filters,
        [name]: e?.value ? e?.value : '',
      })
    }
    return setFilters({
      ...filters,
      [e?.target?.name]: e?.target?.value,
    })
  }

  const handleDeleteSelected = async () => {
    if (window.confirm('Tem certeza que deseja excluir os registros selecionados?')) {
      try {
        await removeReportByIds(selectedRows)
        await filterPauses({ ...filters, page: pages.currentPage }, true)
        setSelectedRows([])
      } catch (error) {
        console.error('Erro ao excluir registros:', error)
      }
    }
  }

  const handleEdit = (index, all = false) => {
    if (editingSingleCell.index) {
      setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
    }

    if (all) {
      setIsEditingAll(true)
      setIsEditingAllColumns(true)
      const newTempData = [
        ...filteredData.map((item) => ({
          ...item,
          date: moment(item.date, 'DD/MM').isValid()
            ? moment(item.date, 'DD/MM').format('YYYY-MM-DD')
            : '',
        })),
      ]
      setTempData(newTempData)
    } else {
      const newTempData = { ...filteredData.filter((e) => e.id === index)[0] }
      newTempData.date = moment(newTempData.date, 'DD/MM').isValid()
        ? moment(newTempData.date, 'DD/MM').format('YYYY-MM-DD')
        : ''
      setTempData(newTempData)
      setEditingId(index)
    }
  }

  const handleEditSingleCell = (index, cellField) => {
    if (editingSingleCell.index === index && editingSingleCell.cellField === cellField) return

    const newTempData = { ...filteredData.filter((e) => e.id === index)[0] }
    newTempData.date = moment(newTempData.date, 'DD/MM').isValid()
      ? moment(newTempData.date, 'DD/MM').format('YYYY-MM-DD')
      : ''
    setTempData(newTempData)
    setEditingSingleCell({ index, cellField })
  }

  const handleSave = (index, arg) => {
    let updatedData = [...newMock]
    if (isEditingAll) {
      const temp = tempData
        .map((item) => {
          const newItem = { ...item }
          Object.keys(columnEdits).forEach((col) => {
            if (columnEdits[col]) {
              newItem[col] = columnEdits[col]
            }
          })
          return newItem
        })
        .map((item) => ({
          ...item,
          date: moment(item.date, 'YYYY-MM-DD').isValid()
            ? moment(item.date, 'YYYY-MM-DD').format('DD/MM')
            : '',
        }))

      updatedData = updatedData.map((item) => {
        const tempItem = temp.find((tempItem) => tempItem.id === item.id)
        return tempItem ? tempItem : item
      })

      setIsEditingAll(false)
      setIsEditingAllColumns(false)
      setColumnEdits({})
    } else {
      const temp = tempData
      temp.date = moment(temp.date, 'YYYY-MM-DD').isValid()
        ? moment(temp.date, 'YYYY-MM-DD').format('DD/MM')
        : ''
      updatedData = updatedData.map((e) => (e.id === index ? temp : e))
    }
    updateReports(
      {
        page: arg?.page,
        limit: 20,
        sector: arg?.sector,
        chapa: arg?.chapa,
        start_date: arg?.data,
        end_date: arg?.dataFim,
        unidad: arg?.unidad,
        break_type: arg?.break_type,
        cpf: arg?.cpf,
        start_time: arg?.start_time,
        start_time_2: arg?.start_time_2,
        end_time: arg?.end_time,
        end_time_2: arg?.end_time_2,
        start_activities: arg?.start_activities,
        start_activities_2: arg?.start_activities_2,
        end_activities: arg?.end_activities,
        end_activities_2: arg?.end_activities_2,
        name: arg?.name,
        signature: arg?.signature,
        jobId: id ? id : undefined,
      },
      updatedData,
    )
      .then(async (res) => {
        // const m = res.data.map((item) => {
        //   return {
        //     date: item.date,
        //     start_time: item.start_time,
        //     end_time: item.end_time,
        //     cpf: item.cpf,
        //     signature: item.signature,
        //     unidad: item.unidad,
        //     sector: item.sector,
        //     break_type: item.break_type,
        //     start_activities: item.start_activities,
        //     end_activities: item.end_activities,
        //     id: item.id,
        //     name: item.name,
        //     evidence: item.evidence,
        //   }
        // })
        handleCancel()
        await filterPauses({ ...filters, page: pages.currentPage }, true)
      })
      .catch((err) => {
        console.log(err)
        // setNewMock(updatedData)
        handleCancel()
        filterPauses({ ...filters, page: pages.currentPage })
        setEditingId(null)
        setTempData({})
      })
  }

  const handleColumnEdit = (column, value) => {
    setColumnEdits((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsEditingAll(false)
    setTempData({})
    setIsEditingAllColumns(false)
    setColumnEdits({})
    setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
  }

  const handleChange = (e, field, all = false, index = false) => {
    if (!all) {
      setTempData({
        ...tempData,
        [field]: e.target.value,
      })
    } else {
      const temp = [...tempData]
      temp[index] = { ...temp[index], [field]: e.target.value }
      setTempData(temp)
    }
  }

  const filterPauses = async (arg, isInputs = false) => {
    try {
      const test = {
        data: '',
        dataFim: '',
        signature: '',
        name: '',
        start_time: '',
        start_time_2: '',
        end_time: '',
        end_time_2: '',
        cpf: '',
        unidad: '',
        sector: '',
        chapa: '',
        break_type: '',
        ano: '',
        start_activities: '',
        start_activities_2: '',
        end_activities: '',
        end_activities_2: '',
        page: pages?.currentPage,
      }

      if (JSON.stringify(arg) !== JSON.stringify(test) && !isInputs) {
        setLoading(true)
        const res = await getAllReports({
          page: arg?.page,
          limit: 20,
          sector: arg?.sector === -1 ? undefined : arg?.sector,
          chapa: arg?.chapa,
          start_date: arg?.data,
          end_date: arg?.dataFim,
          unidad: arg?.unidad === -1 ? undefined : arg?.unidad,
          break_type: arg?.break_type === -1 ? undefined : arg?.break_type,
          cpf: arg?.cpf,
          start_time: arg?.start_time,
          start_time_2: arg?.start_time_2,
          end_time: arg?.end_time,
          end_time_2: arg?.end_time_2,
          start_activities: arg?.start_activities,
          start_activities_2: arg?.start_activities_2,
          end_activities: arg?.end_activities,
          end_activities_2: arg?.end_activities_2,
          name: arg?.name,
          signature: arg?.signature,
          jobId: id ? id : undefined,
        })

        // const m = res.data.map((item) => {
        //   return {
        //     date: item.date,
        //     start_time: item.start_time,
        //     end_time: item.end_time,
        //     cpf: item.cpf,
        //     signature: item.signature,
        //     unidad: item.unidad,
        //     sector: item.sector,
        //     break_type: item.break_type,
        //     start_activities: item.start_activities,
        //     end_activities: item.end_activities,
        //     id: item.id,
        //     name: item.name,
        //     evidence: item.evidence,
        //     refined_fields: item?.refined_fields ? item.refined_fields : [],
        //   }
        // })

        setNewMock(res.data)
        setFilteredData(res.data)
        setNewRecord({
          ...newRecord,
          sector: res.data?.at(-1)?.sector,
          break_type: res.data?.at(-1)?.break_type.startsWith('Térmica')
            ? 'Térmica'
            : 'Psicofísiologica',
          start_activities: res.data?.at(-1)?.start_activities,
          end_activities: res.data?.at(-1)?.end_activities,
        })
        setPages(res.metadata)
        setCanClean(true)
        // setLoading(false)
      }
      if (isInputs) {
        setLoading(true)
        const res = await getAllReports({
          page: arg?.page,
          limit: 20,
          sector: arg?.sector === -1 ? undefined : arg?.sector,
          chapa: arg?.chapa,
          start_date: arg?.data,
          end_date: arg?.dataFim,
          unidad: arg?.unidad === -1 ? undefined : arg?.unidad,
          break_type: arg?.break_type === -1 ? undefined : arg?.break_type,
          cpf: arg?.cpf,
          start_time: arg?.start_time,
          start_time_2: arg?.start_time_2,
          end_time: arg?.end_time,
          end_time_2: arg?.end_time_2,
          start_activities: arg?.start_activities,
          start_activities_2: arg?.start_activities_2,
          end_activities: arg?.end_activities,
          end_activities_2: arg?.end_activities_2,
          name: arg?.name,
          signature: arg?.signature,
          jobId: id ? id : undefined,
        })

        // const m = res.data.map((item) => {
        //   return {
        //     date: item.date,
        //     start_time: item.start_time,
        //     end_time: item.end_time,
        //     cpf: item.cpf,
        //     signature: item.signature,
        //     unidad: item.unidad,
        //     sector: item.sector,
        //     break_type: item.break_type,
        //     start_activities: item.start_activities,
        //     end_activities: item.end_activities,
        //     id: item.id,
        //     name: item.name,
        //     evidence: item.evidence,
        //     refined_fields: item?.refined_fields ? item.refined_fields : [],
        //   }
        // })

        setNewMock(res.data)
        setFilteredData(res.data)
        setNewRecord({
          ...newRecord,
          sector: res.data?.at(-1)?.sector,
          break_type: res.data?.at(-1)?.break_type.startsWith('Térmica')
            ? 'Térmica'
            : 'Psicofísiologica',
          start_activities: res.data?.at(-1)?.start_activities,
          end_activities: res.data?.at(-1)?.end_activities,
        })
        setPages(res.metadata)
        setCanClean(true)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    }
    setLoading(false)
  }

  const addRegistersButtons = useCallback(() => {
    return (
      id && (
        <>
          {addingNewRecord ? (
            <>
              <CButton color="success" disabled={canSaveRow} size="sm" onClick={handleAddNewRecord}>
                <CIcon size="sm" icon={cilCheck} /> Salvar Registro
              </CButton>
              <CButton
                style={{
                  border: '1px var(--cui-primary) solid',
                  color: 'var(--cui-primary)',
                  backgroundColor: 'white',
                }}
                size="sm"
                onClick={() => {
                  setAddingNewRecord(false)
                }}
              >
                <CIcon size="sm" icon={cilX} /> Cancelar Registro
              </CButton>
            </>
          ) : (
            <CButton color="success" size="sm" onClick={() => setAddingNewRecord(true)}>
              <CIcon size="sm" icon={cilPlus} /> Adicionar Registro
            </CButton>
          )}
          <CButton
            color="danger"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0}
          >
            <CIcon size="sm" icon={cilTrash} /> Eliminar Registro
          </CButton>
        </>
      )
    )
  })

  const downloadEvidences = async (arg) => {
    await downloadEvidencesZip({
      page: arg?.page,
      limit: 20,
      sector: arg?.sector,
      chapa: arg?.chapa,
      start_date: arg?.data,
      end_date: arg?.dataFim,
      unidad: arg?.unidad,
      break_type: arg?.break_type,
      cpf: arg?.cpf,
      start_time: arg?.start_time,
      start_time_2: arg?.start_time_2,
      end_time: arg?.end_time,
      end_time_2: arg?.end_time_2,
      start_activities: arg?.start_activities,
      start_activities_2: arg?.start_activities_2,
      end_activities: arg?.end_activities,
      end_activities_2: arg?.end_activities_2,
      name: arg?.name,
      signature: arg?.signature,
      jobId: id ? id : undefined,
    })
  }

  const exportToExcel = async (arg, format) => {
    await getExcelOfReports(
      {
        page: arg?.page,
        limit: 20,
        sector: arg?.sector,
        chapa: arg?.chapa,
        start_date: arg?.data,
        end_date: arg?.dataFim,
        unidad: arg?.unidad,
        break_type: arg?.break_type,
        cpf: arg?.cpf,
        start_time: arg?.start_time,
        start_time_2: arg?.start_time_2,
        end_time: arg?.end_time,
        end_time_2: arg?.end_time_2,
        start_activities: arg?.start_activities,
        start_activities_2: arg?.start_activities_2,
        end_activities: arg?.end_activities,
        end_activities_2: arg?.end_activities_2,
        name: arg?.name,
        signature: arg?.signature,
        jobId: id ? id : undefined,
      },
      format,
    )
  }

  const cleanFilterPauses = async () => {
    refBreakType.current.clearValue()
    refUnidad.current.clearValue()
    refSector.current.clearValue()
    setEditingId(null)
    setTempData({})
    setIsEditingAll(false)
    setIsEditingAllColumns(false)
    setFilters({
      data: '',
      dataFim: '',
      signature: '',
      name: '',
      start_time: '',
      start_time_2: '',
      end_time: '',
      end_time_2: '',
      cpf: '',
      unidad: '',
      sector: '',
      chapa: '',
      break_type: '',
      ano: '',
      start_activities: '',
      start_activities_2: '',
      end_activities: '',
      end_activities_2: '',
    })
    await filterPauses({ page: pages.currentPage })
    setCanClean(false)
    setHasFilters(false)
    // setFilteredData(newMock)
  }

  const checkCellRgbBackground = useCallback((cpf, data, refination) => {
    if (!cpf) return noCpfRow
    if (refination && Array.isArray(refination?.refined)) {
      if (refination?.refined.includes(String(refination?.atual))) {
        return refinationBgColor
      }
    }
    if (!data) return cuiRgb10
    return {}
  }, [])

  const checkCellEditiong = useCallback(
    (id, field) => {
      return editingSingleCell.index === id && editingSingleCell.cellField === field
    },
    [editingSingleCell],
  )

  // const timer = useRef()
  const onClickHandler = (event, onClick = () => {}, onDoubleClick = () => {}) => {
    // clearTimeout(timer.current);

    if (isEditingAll) {
      return
    }
    if (event.detail === 1) {
      return
      // return timer.current = setTimeout(onClick, 200)
    } else if (event.detail === 2) {
      return onDoubleClick()
    }
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.mobile-menu-container')) {
      setIsMobileMenuOpen(false)
    }
  }

  const startPausas = async () => {
    try {
      const resReports = await getAllReports({
        page: pages?.currentPage ? pages.currentPage : 1,
        limit: 20,
        jobId: id ? id : undefined,
      })

      const m = resReports.data.map((item) => ({
        ...item,
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        cpf: item.cpf,
        signature: item.signature,
        unidad: item.unidad,
        sector: item.sector,
        chapa: item.chapa,
        break_type: item.break_type,
        start_activities: item.start_activities,
        end_activities: item.end_activities,
        id: item.id,
        name: item.name,
        evidence: item.evidence,
        refined_fields: item?.refined_fields ? item.refined_fields : [],
      }))

      setPages(resReports.metadata)
      setNewMock(m)
      setFilteredData(m)
      setNewRecord({
        ...newRecord,
        sector: m?.at(-1)?.sector,
        break_type: m?.at(-1)?.break_type.startsWith('Térmica') ? 'Térmica' : 'Psicofísiologica',
        start_activities: m?.at(-1)?.start_activities,
        end_activities: m?.at(-1)?.end_activities,
      })

      const resSector = await getAllSector()
      const respSector = resSector?.data?.map((e) => ({
        value: e?.name,
        label: e?.name,
      }))
      respSector.unshift({ value: -1, label: 'Todos os setores' })
      setSetor(respSector)

      const resUnits = await getAllUnit()
      const respUnits = resUnits?.data?.map((e) => ({
        value: e?.name,
        label: e?.name,
      }))
      respUnits.unshift({ value: -1, label: 'Todas as unidades' })
      setUnidades(respUnits)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao iniciar as pausas:', error)
      setLoading(false)
    }
  }

  const canSaveRow = useMemo(() => {
    return (
      newRecord.start_activities === '' ||
      newRecord.end_activities === '' ||
      newRecord.start_time === '' ||
      newRecord.end_time === '' ||
      newRecord.cpf === '' ||
      newRecord.sector === '' ||
      newRecord.chapa === '' ||
      newRecord.break_type === '' ||
      newRecord.date === ''
    )
  }, [
    newRecord.start_activities,
    newRecord.end_activities,
    newRecord.start_time,
    newRecord.end_time,
    newRecord.cpf,
    newRecord.sector,
    newRecord.chapa,
    newRecord.break_type,
    newRecord.date,
  ])

  useEffect(() => {
    const checkedFilters = checkFilters()
    if (checkedFilters !== hasFilters) {
      setHasFilters(checkedFilters)
    }
  }, [filters])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    console.log(isMobileMenuOpen)

    // window.document.addEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  useEffect(() => {
    startPausas()

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991)
      if (window.innerWidth > 991) setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)

      return window.document.removeEventListener('click', handleClickOutside)
    }
    // }
  }, [])

  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const tableContainerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      setIsScrolledDown(scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CContainer>
      <CModal visible={showExportModal} onClose={() => setShowExportModal(false)}>
        <CModalHeader>
          <CModalTitle>Selecione o formato</CModalTitle>
        </CModalHeader>
        <CModalBody>Selecione o formato de exportação desejado:</CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={() => {
              exportToExcel({ ...filters })
              setShowExportModal(false)
            }}
          >
            XLSX
          </CButton>

          <CButton
            color="secondary"
            onClick={() => {
              exportToExcel({ ...filters }, 'csv')
              setShowExportModal(false)
            }}
          >
            CSV
          </CButton>
        </CModalFooter>
      </CModal>
      <CRow className="mb-3">
        <CCol>
          <h4 className="mb-4">Registro de Pausas dos Colaboradores</h4>
        </CCol>
      </CRow>

      {/* Filtros */}
      <CAccordion flush color="primary">
        <CAccordionItem>
          <CAccordionHeader>Filtros</CAccordionHeader>
          <CAccordionBody>
            {/* {isMobile ? ( */}
            <CCard className="mb-4">
              <CCardBody>
                <CRow className="mb-3">
                  {/* Linha 1: Data Início e Data Fim */}
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Data de Início (a partir de):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="date"
                        name="data"
                        placeholder="Data de início"
                        value={filters.data}
                        onChange={handleFilterChange}
                      />
                      {filters.data && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'data', value: '' } })
                          }
                          aria-label="Limpar data"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Data de Fim (até):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="date"
                        name="dataFim"
                        placeholder="Data de fim"
                        value={filters.dataFim}
                        onChange={handleFilterChange}
                      />
                      {filters.dataFim && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'dataFim', value: '' } })
                          }
                          aria-label="Limpar data fim"
                        />
                      )}
                    </div>
                  </CCol>

                  {/* Linha 2: Rúbrica, Nome e CPF */}
                  {/* <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Rúbrica</CFormLabel>
                    <CFormInput
                      type="text"
                      name="signature"
                      placeholder="Rúbrica"
                      value={filters.signature}
                      onChange={handleFilterChange}
                    />
                  </CCol> */}
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Nome</CFormLabel>
                    <CFormInput
                      type="text"
                      name="name"
                      placeholder="Nome"
                      value={filters.name}
                      onChange={handleFilterChange}
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Chapa</CFormLabel>
                    <CFormInput
                      type="text"
                      name="chapa"
                      placeholder="Chapa"
                      value={filters.chapa}
                      onChange={handleFilterChange}
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>CPF</CFormLabel>
                    <CFormInput
                      type="text"
                      name="cpf"
                      placeholder="CPF"
                      value={filters.cpf}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        if (/^\d*$/.test(inputValue)) {
                          // handleChange(e, 'cpf', isEditingAll, index)
                          handleFilterChange(e)
                        }
                      }}
                    />
                  </CCol>

                  {/* Linha 3: Hora Início e Hora Fim */}
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Hora Início (a partir de):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="start_time"
                        placeholder="Hora Início de:"
                        value={filters.start_time}
                        onChange={handleFilterChange}
                      />
                      {filters.start_time && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'start_time', value: '' } })
                          }
                          aria-label="Limpar hora início de:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Hora Início (até):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="start_time_2"
                        placeholder="Hora Início até:"
                        value={filters.start_time_2}
                        onChange={handleFilterChange}
                      />
                      {filters.start_time_2 && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'start_time_2', value: '' } })
                          }
                          aria-label="Limpar hora início até:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Hora Fim (a partir de):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="end_time"
                        placeholder="Hora Fim de:"
                        value={filters.end_time}
                        onChange={handleFilterChange}
                      />
                      {filters.end_time && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'end_time', value: '' } })
                          }
                          aria-label="Limpar hora fim de:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Hora Fim (até):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="end_time_2"
                        placeholder="Hora Fim até:"
                        value={filters.end_time_2}
                        onChange={handleFilterChange}
                      />
                      {filters.end_time_2 && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'end_time_2', value: '' } })
                          }
                          aria-label="Limpar hora fim até:"
                        />
                      )}
                    </div>
                  </CCol>

                  {/* Linha 4: Unidade, Setor e Tipo */}
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Unidade</CFormLabel>
                    <CreatableSelect
                      options={unidades}
                      // value={filters.unidad}
                      ref={refUnidad}
                      isClearable
                      name="unidad"
                      onChange={(e) => handleFilterChange(e, 'unidad')}
                      isSearchable
                      placeholder="Selecione uma unidade"
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Setor</CFormLabel>
                    <CreatableSelect
                      options={setor}
                      // value={filters.sector}
                      ref={refSector}
                      isClearable
                      name="sector"
                      onChange={(e) => handleFilterChange(e, 'sector')}
                      isSearchable
                      placeholder="Selecione um setor"
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Tipo</CFormLabel>
                    <CreatableSelect
                      options={mockTipo}
                      // value={filters.break_type}
                      ref={refBreakType}
                      isClearable
                      name="break_type"
                      onChange={(e) => handleFilterChange(e, 'break_type')}
                      isSearchable
                      placeholder="Selecione um tipo"
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Início das atividades (a partir de):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="start_activities"
                        placeholder="Início atividades de:"
                        value={filters.start_activities}
                        onChange={handleFilterChange}
                      />
                      {filters.start_activities && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'start_activities', value: '' } })
                          }
                          aria-label="Limpar hora início atividades de:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Início das atividades (até):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="start_activities_2"
                        placeholder="Início atividades até:"
                        value={filters.start_activities_2}
                        onChange={handleFilterChange}
                      />
                      {filters.start_activities_2 && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({
                              target: { name: 'start_activities_2', value: '' },
                            })
                          }
                          aria-label="Limpar hora início atividades até:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Fim das atividades (a partir de):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="end_activities"
                        placeholder="Fim atividades de:"
                        value={filters.end_activities}
                        onChange={handleFilterChange}
                      />
                      {filters.end_activities && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'end_activities', value: '' } })
                          }
                          aria-label="Limpar hora fim atividades de:"
                        />
                      )}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1">
                    <CFormLabel>Fim das atividades (até):</CFormLabel>
                    <div style={{ position: 'relative' }}>
                      <CFormInput
                        type="time"
                        name="end_activities_2"
                        placeholder="Fim atividades até:"
                        value={filters.end_activities_2}
                        onChange={handleFilterChange}
                      />
                      {filters.end_activities_2 && (
                        <CIcon
                          icon={cilX}
                          className="custom-input-close"
                          onClick={() =>
                            handleFilterChange({ target: { name: 'end_activities_2', value: '' } })
                          }
                          aria-label="Limpar hora fim atividades até:"
                        />
                      )}
                    </div>
                  </CCol>

                  {/* Linha 5: Botões de Ação */}
                  <CCol xs={12} sm={6} md={4} lg={3} className="mb-1 mt-2 d-flex align-items-end">
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() => {
                        // setCanClean(true)
                        return filterPauses({ ...filters, page: 1 })
                      }}
                      disabled={!hasFilters}
                    >
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
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>

      {/* Tabela Filtrada */}
      <CCard className="mb-4 mt-4">
        <CCardBody className="text-center align-items-center">
          <div
            ref={tableContainerRef}
            className={`horizontal-scroll-container ${isScrolledDown ? 'scroll-bottom' : 'scroll-top'}`}
            style={{ overflowX: 'auto' }}
          >
            <CTable bordered>
              <CTableHead>
                <CTableRow>
                  {isEditingAllColumns && (
                    <CTableHeaderCell colSpan={13}>Editar Colunas</CTableHeaderCell>
                  )}
                </CTableRow>
                <CTableRow className="align-middle">
                  {id && (
                    <CTableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === filteredData.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(filteredData.map((item) => item.reportId))
                          } else {
                            setSelectedRows([])
                          }
                        }}
                      />
                    </CTableHeaderCell>
                  )}
                  <CTableHeaderCell>
                    DATA
                    {isEditingAllColumns && (
                      <CFormInput
                        value={columnEdits.date || ''}
                        type="date"
                        onChange={(e) => handleColumnEdit('date', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>

                  <CTableHeaderCell>
                    RÚBRICA
                    {/* {isEditingAllColumns && (
                    <CFormInput
                      value={columnEdits.signature || ''}
                      onChange={(e) => handleColumnEdit('signature', e.target.value)}
                      className="mt-1"
                    />
                  )} */}
                  </CTableHeaderCell>

                  {/* Repita para as demais colunas editáveis */}
                  <CTableHeaderCell>
                    NOME
                    {/* {isEditingAllColumns && (
                    <CFormInput
                      value={columnEdits.name || ''}
                      onChange={(e) => handleColumnEdit('name', e.target.value)}
                      className="mt-1"
                    />
                  )} */}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'HORA INICIO'}
                    {isEditingAllColumns && (
                      <CFormInput
                        value={columnEdits.start_time || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('start_time', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'HORA FIM'}
                    {isEditingAllColumns && (
                      <CFormInput
                        value={columnEdits.end_time || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('end_time', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'CPF'}
                    {/* {isEditingAllColumns && (
                    <CFormInput
                      value={columnEdits.cpf || ''}
                      onChange={(e) => handleColumnEdit('cpf', e.target.value)}
                      className="mt-1"
                    />
                  )} */}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'UNIDADE'}
                    {/* {isEditingAllColumns && (
                    <CFormInput
                      value={columnEdits.unidad || ''}
                      onChange={(e) => handleColumnEdit('unidad', e.target.value)}
                      className="mt-1"
                    />
                  )} */}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'SETOR'}
                    {/* {isEditingAllColumns && (
                    <CFormInput
                      value={columnEdits.sector || ''}
                      onChange={(e) => handleColumnEdit('sector', e.target.value)}
                      className="mt-1"
                    />
                  )} */}
                  </CTableHeaderCell>
                  <CTableHeaderCell>{'CHAPA'}</CTableHeaderCell>
                  <CTableHeaderCell>
                    {'TIPO DE PAUSA'}
                    {isEditingAllColumns && (
                      <CFormSelect
                        options={['Térmica', 'Psicofísiologica']}
                        value={columnEdits.break_type || ''}
                        onChange={(e) => handleColumnEdit('break_type', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'INICIO DAS ATIVIDADES'}
                    {isEditingAllColumns && (
                      <CFormInput
                        value={columnEdits.start_activities || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('start_activities', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    {'FIM DAS ATIVIDADES'}
                    {isEditingAllColumns && (
                      <CFormInput
                        value={columnEdits.end_activities || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('end_activities', e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </CTableHeaderCell>
                  <CTableHeaderCell>EVIDÊNCIA</CTableHeaderCell>
                  <CTableHeaderCell>EDITAR</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={13} className="text-center">
                      <CSpinner color="primary" />
                    </CTableDataCell>
                  </CTableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <CTableRow style={{}} key={index}>
                      {id && (
                        <CTableDataCell>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.reportId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, item.reportId])
                              } else {
                                setSelectedRows(selectedRows.filter((id) => id !== item.reportId))
                              }
                            }}
                          />
                        </CTableDataCell>
                      )}
                      <CTableDataCell
                        style={checkCellRgbBackground(item.cpf, item.date, {
                          refined: item?.refined_fields,
                          atual: 'date',
                        })}
                        onClick={(e) =>
                          onClickHandler(e, null, () => handleEditSingleCell(item.id, 'date'))
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'date') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'date')}
                            type="date"
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'date')
                                ? tempData.date
                                : tempData[index].date || ''
                            }
                            onChange={(e) => handleChange(e, 'date', isEditingAll, index)}
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'date')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.date
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        title={String(item.signature).toLowerCase()}
                        style={{
                          ...checkCellRgbBackground(item.cpf, item.signature, {
                            refined: item?.refined_fields,
                            atual: 'signature',
                          }),
                          textOverflow: isMobile ? 'clip' : 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: isMobile ? 'auto' : 'hidden',
                          maxWidth: '130px',
                        }}
                        // onClick={(e) => onClickHandler(e, null, () => handleEditSingleCell(item.id, "signature"))}
                      >
                        {/* {editingId === item.id || isEditingAll || checkCellEditiong(item.id, "signature") ? (
                        <CFormInput
                          autoFocus={checkCellEditiong(item.id, "signature")}
                          value={
                            editingId === item.id || checkCellEditiong(item.id, "signature")
                              ? tempData.signature
                              : tempData[index].signature || ''
                          }
                          onChange={(e) => handleChange(e, 'signature', isEditingAll, index)}
                          onKeyUp={(e) => {
                            if (checkCellEditiong(item.id, "signature")) {
                              if (e.key === "Escape") {
                                setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                              }
                              if (e.key === "Enter") {
                                handleSave(item.id, filters)
                              }
                            }
                          }}
                        />
                      ) : ( */}
                        {String(item.signature).toLowerCase()}
                        {/* )} */}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        title={String(item.name)}
                        style={{
                          ...checkCellRgbBackground(item.cpf, item.name, {
                            refined: item?.refined_fields,
                            atual: 'name',
                          }),
                          textOverflow: isMobile ? 'clip' : 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: isMobile ? 'auto' : 'hidden',
                          maxWidth: '240px',
                        }}
                        // onClick={(e) => onClickHandler(e, null, () => handleEditSingleCell(item.id, "name"))}
                      >
                        {/* {editingId === item.id || isEditingAll || checkCellEditiong(item.id, "name") ? (
                        <CFormInput
                          autoFocus={checkCellEditiong(item.id, "name")}
                          value={editingId === item.id || checkCellEditiong(item.id, "name") ? tempData.name : tempData[index].name || ''}
                          onChange={(e) => handleChange(e, 'name', isEditingAll, index)}
                          onKeyUp={(e) => {
                            if (checkCellEditiong(item.id, "name")) {
                              if (e.key === "Escape") {
                                setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                              }
                              if (e.key === "Enter") {
                                handleSave(item.id, filters)
                              }
                            }
                          }}
                        />
                      ) : ( */}
                        {String(item.name).toLowerCase()}
                        {/* )} */}
                      </CTableDataCell>
                      <CTableDataCell
                        style={checkCellRgbBackground(item.cpf, item.start_time, {
                          refined: item?.refined_fields,
                          atual: 'start_time',
                        })}
                        onClick={(e) =>
                          onClickHandler(e, null, () => handleEditSingleCell(item.id, 'start_time'))
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'start_time') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'start_time')}
                            type="time"
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'start_time')
                                ? tempData.start_time
                                : tempData[index].start_time || ''
                            }
                            onChange={(e) => handleChange(e, 'start_time', isEditingAll, index)}
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'start_time')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.start_time
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={checkCellRgbBackground(item.cpf, item.end_time, {
                          refined: item?.refined_fields,
                          atual: 'end_time',
                        })}
                        onClick={(e) =>
                          onClickHandler(e, null, () => handleEditSingleCell(item.id, 'end_time'))
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'end_time') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'end_time')}
                            type="time"
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'end_time')
                                ? tempData.end_time
                                : tempData[index].end_time || ''
                            }
                            onChange={(e) => handleChange(e, 'end_time', isEditingAll, index)}
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'end_time')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.end_time
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        onClick={(e) =>
                          onClickHandler(e, null, () => handleEditSingleCell(item.id, 'cpf'))
                        }
                        style={checkCellRgbBackground(item.cpf, item.cpf, {
                          refined: item?.refined_fields,
                          atual: 'cpf',
                        })}
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'cpf') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'cpf')}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'cpf')
                                ? tempData.cpf
                                : tempData[index]?.cpf || ''
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value
                              if (/^\d*$/.test(inputValue)) {
                                handleChange(e, 'cpf', isEditingAll, index)
                              }
                            }}
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'cpf')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.cpf
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        style={checkCellRgbBackground(item.cpf, item.unidad, {
                          refined: item?.refined_fields,
                          atual: 'unidad',
                        })}
                        // onClick={(e) => onClickHandler(e, null, () => handleEditSingleCell(item.id, "unidad"))}
                      >
                        {/* {editingId === item.id || isEditingAll || checkCellEditiong(item.id, "unidad") ? (
                        <CFormInput
                          autoFocus={checkCellEditiong(item.id, "unidad")}
                          value={
                            editingId === item.id || checkCellEditiong(item.id, "unidad") ? tempData.unidad : tempData[index].unidad || ''
                          }
                          onChange={(e) => handleChange(e, 'unidad', isEditingAll, index)}
                          onKeyUp={(e) => {
                            if (checkCellEditiong(item.id, "unidad")) {
                              if (e.key === "Escape") {
                                setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                              }
                              if (e.key === "Enter") {
                                handleSave(item.id, filters)
                              }
                            }
                          }}
                        />
                      ) : ( */}
                        {item.unidad}
                        {/* )} */}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        title={String(item.sector)}
                        style={{
                          ...checkCellRgbBackground(item.cpf, item.sector, {
                            refined: item?.refined_fields,
                            atual: 'sector',
                          }),
                          textOverflow: isMobile ? 'clip' : 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: isMobile ? 'auto' : 'hidden',
                          maxWidth: '136px',
                        }}
                      >
                        {String(item.sector).toLowerCase()}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        title={String(item.chapa)}
                        style={{
                          ...checkCellRgbBackground(item.cpf, item.chapa, {
                            refined: item?.refined_fields,
                            atual: 'chapa',
                          }),
                          textOverflow: isMobile ? 'clip' : 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: isMobile ? 'auto' : 'hidden',
                          maxWidth: '136px',
                        }}
                      >
                        {String(item.chapa).toLowerCase()}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-capitalize"
                        style={{
                          ...checkCellRgbBackground(item.cpf, item.break_type, {
                            refined: item?.refined_fields,
                            atual: 'break_type',
                          }),
                          whiteSpace: 'nowrap',
                          overflow: 'auto',
                          maxWidth: '140px',
                        }}
                        onClick={(e) =>
                          onClickHandler(e, null, () => handleEditSingleCell(item.id, 'break_type'))
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'break_type') ? (
                          <CFormSelect
                            options={['Térmica', 'Psicofísiologica']}
                            autoFocus={checkCellEditiong(item.id, 'break_type')}
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'break_type')
                                ? tempData.break_type
                                : tempData[index].break_type || ''
                            }
                            onChange={(e) => handleChange(e, 'break_type', isEditingAll, index)}
                            onKeyDown={(e) => {
                              e.preventDefault()
                              if (checkCellEditiong(item.id, 'break_type')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  e.preventDefault()
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.break_type
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={checkCellRgbBackground(item.cpf, item.start_activities, {
                          refined: item?.refined_fields,
                          atual: 'start_activities',
                        })}
                        onClick={(e) =>
                          onClickHandler(e, null, () =>
                            handleEditSingleCell(item.id, 'start_activities'),
                          )
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'start_activities') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'start_activities')}
                            type="time"
                            value={
                              editingId === item.id ||
                              checkCellEditiong(item.id, 'start_activities')
                                ? tempData.start_activities
                                : tempData[index].start_activities || ''
                            }
                            onChange={(e) =>
                              handleChange(e, 'start_activities', isEditingAll, index)
                            }
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'start_activities')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.start_activities
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={checkCellRgbBackground(item.cpf, item.end_activities, {
                          refined: item?.refined_fields,
                          atual: 'end_activities',
                        })}
                        onClick={(e) =>
                          onClickHandler(e, null, () =>
                            handleEditSingleCell(item.id, 'end_activities'),
                          )
                        }
                      >
                        {editingId === item.id ||
                        isEditingAll ||
                        checkCellEditiong(item.id, 'end_activities') ? (
                          <CFormInput
                            autoFocus={checkCellEditiong(item.id, 'end_activities')}
                            type="time"
                            value={
                              editingId === item.id || checkCellEditiong(item.id, 'end_activities')
                                ? tempData.end_activities
                                : tempData[index].end_activities || ''
                            }
                            onChange={(e) => handleChange(e, 'end_activities', isEditingAll, index)}
                            onKeyUp={(e) => {
                              if (checkCellEditiong(item.id, 'end_activities')) {
                                if (e.key === 'Escape') {
                                  setEditingSingleCell(EDITING_SINGLE_CELL_DEFAULT)
                                }
                                if (e.key === 'Enter' && !isEditingAll) {
                                  handleSave(item.id, filters)
                                }
                              }
                            }}
                          />
                        ) : (
                          item.end_activities
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        className="text-center"
                        style={checkCellRgbBackground(item.cpf, true)}
                      >
                        <CLink
                          onClick={(e) => {
                            e.preventDefault()
                            downloadImage(item.evidence)
                          }}
                          style={{ cursor: 'pointer', backgroundColor: 'unset' }}
                          className="text-decoration-none"
                        >
                          Ver
                        </CLink>
                      </CTableDataCell>
                      <CTableDataCell style={checkCellRgbBackground(item.cpf, true)}>
                        {!isEditingAll ? (
                          editingId === item.id ? (
                            <div className="d-flex gap-2">
                              <CButton
                                color="primary"
                                size="sm"
                                onClick={() => handleSave(item.id, filters)}
                              >
                                <CIcon size="sm" icon={cilCheck} />
                              </CButton>
                              <CButton
                                style={{
                                  border: '1px var(--cui-primary) solid',
                                  color: 'var(--cui-primary)',
                                }}
                                size="sm"
                                onClick={handleCancel}
                              >
                                <CIcon size="sm" icon={cilX} />
                              </CButton>
                            </div>
                          ) : (
                            <CIcon
                              size="sm"
                              icon={cilPencil}
                              onClick={() => handleEdit(item.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          )
                        ) : (
                          <></>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={13} className="text-center">
                      {'Nenhum dado encontrado.'}
                    </CTableDataCell>
                  </CTableRow>
                )}
                {isEditingAllColumns && (
                  <CTableRow>
                    <CTableHeaderCell>
                      <CFormInput
                        value={columnEdits.date || ''}
                        type="date"
                        onChange={(e) => handleColumnEdit('date', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell>
                      <CFormInput
                        value={columnEdits.start_time || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('start_time', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <CFormInput
                        value={columnEdits.end_time || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('end_time', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell>
                      <CFormSelect
                        options={['Térmica', 'Psicofísiologica']}
                        value={columnEdits.break_type || ''}
                        onChange={(e) => handleColumnEdit('break_type', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <CFormInput
                        value={columnEdits.start_activities || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('start_activities', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <CFormInput
                        value={columnEdits.end_activities || ''}
                        type="time"
                        onChange={(e) => handleColumnEdit('end_activities', e.target.value)}
                        className="mt-1"
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                )}
                {addingNewRecord && (
                  <CTableRow>
                    {/* Checkbox (desabilitado para novo registro) */}
                    <CTableDataCell>
                      <input type="checkbox" disabled />
                    </CTableDataCell>

                    {/* Data */}
                    <CTableDataCell>
                      <CFormInput
                        required
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      />
                    </CTableDataCell>

                    {/* Rúbrica */}
                    <CTableDataCell>
                      {/* <CFormInput
                        value={newRecord.signature}
                        onChange={(e) => setNewRecord({ ...newRecord, signature: e.target.value })}
                      /> */}
                    </CTableDataCell>

                    {/* Nome */}
                    <CTableDataCell>
                      {/* <CFormInput
                        value={newRecord.name}
                        onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                      /> */}
                    </CTableDataCell>

                    {/* Hora Inicio */}
                    <CTableDataCell>
                      <CFormInput
                        required
                        type="time"
                        value={newRecord.start_time}
                        onChange={(e) => setNewRecord({ ...newRecord, start_time: e.target.value })}
                      />
                    </CTableDataCell>

                    {/* Hora Fim */}
                    <CTableDataCell>
                      <CFormInput
                        required
                        type="time"
                        value={newRecord.end_time}
                        onChange={(e) => setNewRecord({ ...newRecord, end_time: e.target.value })}
                      />
                    </CTableDataCell>

                    {/* CPF */}
                    <CTableDataCell>
                      <CFormInput
                        required
                        value={newRecord.cpf}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setNewRecord({ ...newRecord, cpf: e.target.value })
                          }
                        }}
                      />
                    </CTableDataCell>

                    {/* Unidade */}
                    <CTableDataCell>
                      {/* <CFormSelect
                        value={newRecord.unidad}
                        onChange={(e) => setNewRecord({ ...newRecord, unidad: e.target.value })}
                      >
                        {unidades.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </CFormSelect> */}
                    </CTableDataCell>

                    {/* Setor */}
                    <CTableDataCell>
                      <CFormSelect
                        value={newRecord.sector}
                        defaultValue={filteredData[0]?.sector}
                        required
                        onChange={(e) => setNewRecord({ ...newRecord, sector: e.target.value })}
                      >
                        {setor.map((sect) => (
                          <option
                            key={sect.value}
                            defaultValue={filteredData[0]?.sector}
                            value={sect.value}
                          >
                            {sect.label}
                          </option>
                        ))}
                      </CFormSelect>
                    </CTableDataCell>

                    {/* Chapa */}
                    <CTableDataCell>
                      {/* <CFormInput
                        value={newRecord.name}
                        onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                      /> */}
                    </CTableDataCell>

                    {/* Tipo de Pausa */}
                    <CTableDataCell>
                      <CFormSelect
                        value={newRecord.break_type}
                        defaultValue={String(filteredData?.at(-1)?.break_type).startsWith(
                          'Térmica' ? 'Térmica' : 'Psicofísiologica',
                        )}
                        required
                        onChange={(e) => setNewRecord({ ...newRecord, break_type: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        <option value="Térmica">Térmica</option>
                        <option value="Psicofísiologica">Psicofísiologica</option>
                      </CFormSelect>
                    </CTableDataCell>

                    {/* Inicio das Atividades */}
                    <CTableDataCell>
                      <CFormInput
                        type="time"
                        required
                        value={newRecord.start_activities}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, start_activities: e.target.value })
                        }
                      />
                    </CTableDataCell>

                    {/* Fim das Atividades */}
                    <CTableDataCell>
                      <CFormInput
                        type="time"
                        required
                        value={newRecord.end_activities}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, end_activities: e.target.value })
                        }
                      />
                    </CTableDataCell>

                    {/* Evidência (placeholder) */}
                    <CTableDataCell className="text-center">
                      <span className="text-muted">Nova evidência</span>
                    </CTableDataCell>

                    {/* Ações */}
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          color="success"
                          size="sm"
                          disabled={canSaveRow}
                          onClick={handleAddNewRecord}
                        >
                          <CIcon icon={cilCheck} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => setAddingNewRecord(false)}>
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
          <CCol
            // xs={12}
            // sm={6}
            // md={4}
            // lg={3}
            className="d-flex align-self-center justify-content-center flex-wrap mt-2 gap-1"
          >
            {pages && (
              <CPagination
                align="center"
                size="sm"
                aria-label="Page navigation"
                // className="d-flex align-self-center justify-content-center flex-wrap mt-2 gap-1"
                style={{
                  overflowX: 'auto',
                  display: 'flex',
                  gap: '4px',
                  padding: '8px 0',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {pageRange.length > 0 && (
                  <>
                    <CPaginationItem
                      onClick={() => {
                        handleCancel()
                        filterPauses({ ...filters, page: 1 })
                      }}
                      disabled={pages?.currentPage === 1}
                      style={{
                        border:
                          storedTheme === 'light'
                            ? '1px var(--cui-primary) solid'
                            : '1px var(--color-light-gray-blue) solid',
                        color:
                          storedTheme === 'light'
                            ? 'var(--cui-primary)'
                            : 'var(--color-light-gray-blue)',
                        // fontSize: '12px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span aria-hidden="true">≪</span>
                    </CPaginationItem>
                    <CPaginationItem
                      onClick={() => {
                        handleCancel()
                        filterPauses({ ...filters, page: pages?.currentPage - 1 })
                      }}
                      disabled={pages?.currentPage === 1}
                      style={{
                        border:
                          storedTheme === 'light'
                            ? '1px var(--cui-primary) solid'
                            : '1px var(--color-light-gray-blue) solid',
                        color:
                          storedTheme === 'light'
                            ? 'var(--cui-primary)'
                            : 'var(--color-light-gray-blue)',
                        // fontSize: '12px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {'<'}
                    </CPaginationItem>
                  </>
                )}
                {pageRange.map((page) => (
                  <CPaginationItem
                    key={page}
                    style={{
                      flexShrink: 0,
                      minWidth: '32px',
                      // fontSize: '12px',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      ...(storedTheme === 'light'
                        ? {
                            border: '1px var(--cui-primary) solid',
                            color: 'var(--cui-primary)',
                            backgroundColor:
                              pages?.currentPage === page
                                ? 'var(--color-light-gray-blue)'
                                : 'white',
                          }
                        : {
                            border: '1px var(--color-light-gray-blue) solid',
                            color: 'var(--color-light-gray-blue)',
                            backgroundColor:
                              pages?.currentPage === page ? 'var(--cui-primary)' : 'white',
                          }),
                    }}
                    onClick={() => {
                      handleCancel()
                      filterPauses({ ...filters, page })
                    }}
                    active={pages?.currentPage === page}
                    disabled={pages?.currentPage === page}
                  >
                    {page}
                  </CPaginationItem>
                ))}
                {pageRange.length > 0 && (
                  <>
                    <CPaginationItem
                      onClick={() => {
                        handleCancel()
                        filterPauses({ ...filters, page: pages?.currentPage + 1 })
                      }}
                      disabled={pages?.currentPage === pages?.totalPages}
                      style={{
                        border:
                          storedTheme === 'light'
                            ? '1px var(--cui-primary) solid'
                            : '1px var(--color-light-gray-blue) solid',
                        color:
                          storedTheme === 'light'
                            ? 'var(--cui-primary)'
                            : 'var(--color-light-gray-blue)',
                        // fontSize: '12px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span aria-hidden="true">{'>'}</span>
                    </CPaginationItem>
                    <CPaginationItem
                      onClick={() => {
                        handleCancel()
                        filterPauses({ ...filters, page: pages?.totalPages })
                      }}
                      disabled={pages?.currentPage === pages?.totalPages}
                      style={{
                        border:
                          storedTheme === 'light'
                            ? '1px var(--cui-primary) solid'
                            : '1px var(--color-light-gray-blue) solid',
                        color:
                          storedTheme === 'light'
                            ? 'var(--cui-primary)'
                            : 'var(--color-light-gray-blue)',
                        // fontSize: '12px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span aria-hidden="true">≫</span>
                    </CPaginationItem>
                  </>
                )}
              </CPagination>
            )}
          </CCol>
          <CCol className="justify-content-right align-content-end d-flex mt-2 mb-5 flex-wrap text-end flex-column">
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', fontSize: '13px' }}
              className="align-items-center"
            >
              <span>Não encontrou o CPF na base</span>
              <div
                style={{
                  ...noCpfRow,
                  width: '2rem',
                  height: '2rem',
                  // backgroundColor: '#800080', // Roxo
                  border: '1px solid #000',
                }}
              />
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', fontSize: '13px' }}
              className="align-items-center"
            >
              <span>Não conseguiu processar o valor</span>
              <div
                style={{
                  ...cuiRgb10,
                  width: '2rem',
                  height: '2rem',
                  // backgroundColor: '#ff0000', // Vermelho
                  border: '1px solid #000',
                }}
              />
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', fontSize: '13px' }}
              className="align-items-center"
            >
              <span>Campo tratado com refinamento</span>
              <div
                style={{
                  ...refinationBgColor,
                  width: '2rem',
                  height: '2rem',
                  // backgroundColor: '#ffff00', // Amarelo
                  border: '1px solid #000',
                }}
              />
            </div>

            <span style={{ fontSize: '13px' }}>Clique duplo, abre para editar o campo</span>
          </CCol>
          <div
            style={{
              position: 'fixed',
              bottom: isMobile ? '20px' : '30px',
              left: isMobile ? '20px' : 'auto',
              right: isMobile ? 'auto' : 'auto',
              zIndex: 1000,
              transition: 'all 0.3s ease',
              position: 'fixed',
            }}
          >
            {isMobile ? (
              <div className="d-flex flex-wrap justify-content-start gap-1">
                {isMobileMenuOpen && (
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      padding: '8px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                    }}
                    className="d-flex flex-column gap-1"
                  >
                    <CButton color="info" size="sm" onClick={() => exportToExcel({ ...filters })}>
                      <CIcon size="sm" icon={cilCheck} /> Exportar para Excel
                    </CButton>
                    <CButton
                      color="warning"
                      size="sm"
                      onClick={() => downloadEvidences({ ...filters })}
                    >
                      <CIcon size="sm" icon={cilCheck} /> Baixar Evidências
                    </CButton>
                    {isEditingAll ? (
                      // <div className="d-flex gap-1">
                      <>
                        <CButton
                          style={{ minWidth: '60px' }}
                          color="primary"
                          size="sm"
                          onClick={() => handleSave(0, filters)}
                        >
                          <CIcon size="sm" icon={cilCheck} /> Salvar Tudo
                        </CButton>
                        <CButton
                          style={{
                            border: '1px var(--cui-primary) solid',
                            color: 'var(--cui-primary)',
                          }}
                          size="sm"
                          onClick={handleCancel}
                        >
                          <CIcon size="sm" icon={cilX} /> Cancelar
                        </CButton>
                        {addRegistersButtons()}
                      </>
                    ) : (
                      // </div>
                      <>
                        <CButton color="primary" size="sm" onClick={() => handleEdit(null, true)}>
                          <CIcon size="sm" icon={cilPencil} /> Editar Tudo
                        </CButton>
                        {addRegistersButtons()}
                      </>
                    )}
                  </div>
                )}
                <CButton
                  color="primary"
                  style={{
                    width: !isMobileMenuOpen ? '56px' : '45px',
                    height: !isMobileMenuOpen ? '56px' : '45px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'all 0.7s ease',
                  }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <CIcon icon={isMobileMenuOpen ? cilX : cilMenu} />
                </CButton>
              </div>
            ) : (
              <div
                style={{
                  position: 'fixed',
                  bottom: '30px',
                  left: '390px',
                  zIndex: 1000,
                  padding: '10px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                className="d-flex flex-wrap justify-content-start gap-1"
              >
                <CButton color="info" size="sm" onClick={() => setShowExportModal(true)}>
                  <CIcon size="sm" icon={cilCheck} /> Exportar para Excel
                </CButton>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => downloadEvidences({ ...filters })}
                >
                  <CIcon size="sm" icon={cilCheck} /> Baixar Evidências
                </CButton>
                {isEditingAll ? (
                  // <div className="d-flex gap-1">
                  <>
                    <CButton
                      style={{ minWidth: '60px' }}
                      color="primary"
                      size="sm"
                      onClick={() => handleSave(0, filters)}
                    >
                      <CIcon size="sm" icon={cilCheck} /> Salvar Tudo
                    </CButton>
                    <CButton
                      style={{
                        border: '1px var(--cui-primary) solid',
                        color: 'var(--cui-primary)',
                        backgroundColor: 'white',
                      }}
                      size="sm"
                      onClick={handleCancel}
                    >
                      <CIcon size="sm" icon={cilX} /> Cancelar
                    </CButton>
                    {addRegistersButtons()}
                  </>
                ) : (
                  // </div>
                  <>
                    <CButton color="primary" size="sm" onClick={() => handleEdit(null, true)}>
                      <CIcon size="sm" icon={cilPencil} /> Editar Tudo
                    </CButton>
                    {addRegistersButtons()}
                  </>
                )}
              </div>
            )}
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Pausas
