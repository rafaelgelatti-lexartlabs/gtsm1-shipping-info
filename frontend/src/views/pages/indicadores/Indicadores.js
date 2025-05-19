import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import { CChart, CChartBar, CChartLine } from '@coreui/react-chartjs'
import React, { useEffect, useState } from 'react'

const Indicators = () => {
  // const data = getDataInStorage('pauses')
  const [indicators, setIndicators] = useState({
    pausaMenor20: 0,
    naoAssinaram: 0,
    assinaram1vez: 0,
    topColaboradores: [],
  })

  const processarIndicadores = (dados) => {
    const pausasCurta = dados.filter((item) => {
      const [horaIni, minIni] = item.hora_inicio.split(':').map(Number)
      const [horaFim, minFim] = item.hora_fim.split(':').map(Number)

      const totalMinutosIni = horaIni * 60 + minIni
      const totalMinutosFim = horaFim * 60 + minFim

      return totalMinutosFim - totalMinutosIni < 20
    }).length

    const contagemCPF = dados.reduce((acc, { cpf }) => {
      acc[cpf] = (acc[cpf] || 0) + 1
      return acc
    }, {})

    const listaCompletaCPFs = dados.map((e) => e?.cpf)

    const todosCPFs = new Set([...dados.map((item) => item.cpf), ...listaCompletaCPFs])
    const naoAssinaram = [...todosCPFs].filter((cpf) => !contagemCPF[cpf]).length

    const assinaram1vez = Object.values(contagemCPF).filter((count) => count === 1).length

    const topColaboradores = Object.entries(contagemCPF)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cpf, count]) => ({
        nome: dados.find((item) => item.cpf === cpf)?.nome || 'Desconhecido',
        assinaturas: count,
      }))

    return {
      pausasMenor20: pausasCurta,
      naoAssinaram,
      assinaram1vez,
      topColaboradores,
    }
  }

  useEffect(() => {
    // if (data) {
    //   const dadosTransformados = processarIndicadores(data)
    //   setIndicators(dadosTransformados)
    // }
  }, [])

  return (
    <CContainer>
      <div className="indicators-page">
        <h2 className="mb-4">Indicadores de Pausas</h2>

        <CRow>
          {/* Primeiro Card */}
          <CCol md="3" className="mb-4">
            <CCard>
              <CCardHeader>Pausas Curtas</CCardHeader>
              <CCardBody className="text-center">
                <div className="display-4">{indicators.pausaMenor20}</div>
                <small>Casos com pausa menor que 20 minutos</small>
                <CChart
                  type="line"
                  className="mt-3"
                  // style={{ height: '70px' }}
                  data={{
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                    datasets: [
                      {
                        label: 'Histórico',
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        data: [5, 8, 12, 6, 15],
                      },
                    ],
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>

          {/* Segundo Card */}
          <CCol md="3" className="mb-4">
            <CCard>
              <CCardHeader>Não Conformidades</CCardHeader>
              <CCardBody className="text-center">
                <div className="display-4">{indicators.naoAssinaram}</div>
                <small>Colaboradores sem assinaturas</small>
                <CChartBar
                  className="mt-3"
                  // style={{ height: '70px' }}
                  data={{
                    labels: ['Não assinaram'],
                    datasets: [
                      {
                        label: 'Quantidade',
                        backgroundColor: '#ff6384',
                        data: [indicators.naoAssinaram],
                      },
                    ],
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>

          {/* Terceiro Card */}
          <CCol md="3" className="mb-4">
            <CCard>
              <CCardHeader>Assinaturas Únicas</CCardHeader>
              <CCardBody className="text-center">
                <div className="display-4">{indicators.assinaram1vez}</div>
                <small>Assinaram apenas 1 vez</small>
                <CChartLine
                  className="mt-3"
                  // style={{ height: '70px' }}
                  data={{
                    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                      {
                        label: 'Semanas',
                        backgroundColor: '#4bc0c0',
                        data: [2, 5, 3, 7],
                      },
                    ],
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>

          {/* Quarto Card - Top 5 */}
          <CCol md="3" className="mb-4">
            <CCard>
              <CCardHeader>Top Colaboradores</CCardHeader>
              <CCardBody>
                <CListGroup>
                  {indicators.topColaboradores.map((colab, index) => (
                    <CListGroupItem
                      key={index}
                      className="d-flex justify-content-between align-items-center text-capitalize"
                    >
                      <span>{String(colab.nome).toLowerCase()}</span>
                      <span className="badge badge-primary badge-pill text-capitalize">
                        {String(colab.assinaturas).toLowerCase()}
                      </span>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </CContainer>
  )
}

export default Indicators
