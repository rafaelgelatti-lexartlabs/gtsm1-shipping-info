import axios from 'axios'
import { getTokenInStorage } from './localstorage'

const BASE_API_URL = import.meta.env.VITE_PUBLIC_API_URL

axios.interceptors.request.use(
  async (config) => {
    const { token } = getTokenInStorage() || ''

    if (token) {
      config.headers['Authorization'] = `${token}`
    }

    // Platform.OS === "ios"
    //   ? config.headers.device === "ios"
    //   : config.headers.device === "android";
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // if ([401].includes(Number(error?.response?.status))) {
    //   console.log(error)

    //   clearStorage()
    //   // history.push('/login')
    //   const event = new CustomEvent('unauthorized', { detail: { message: 'Unauthorized' } })
    //   window.dispatchEvent(event)
    //   throw new Error('Unauthorized')
    // }
    return Promise.reject(error)
  },
)

async function loginApi({ username, password }) {
  try {
    const result = await axios.post(`${BASE_API_URL}/login`, {
      username,
      password,
    })
    return result?.data
  } catch (error) {
    console.error('Error on login', error)
    return error
  }
}

async function uploadImage(files, oldVersion) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      console.error('Tipo de arquivo não suportado. Use JPG, JPEG, PNG ou PDF.')
      return { error: true, message: 'Tipo de arquivo não suportado. Use JPG, JPEG, PNG ou PDF.' }
    }
  }

  try {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('oldVersion', oldVersion.toString())

    const result = await axios.post(`${BASE_API_URL}/image-analyzer/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return result?.data
  } catch (error) {
    console.error('Error on upload image', error)
    return {
      error: error.message || 'Erro ao fazer upload do arquivo.',
      message: error.response?.data?.message,
    }
  }
}

async function uploadPlanilha(file) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ]

  // for (const file of file) {
  if (!allowedTypes.includes(file.type)) {
    console.error('Tipo de arquivo não suportado. Use XLSX e CSV.')
    return { error: true, message: 'Tipo de arquivo não suportado. Use XLSX e CSV.' }
  }
  // }

  try {
    const formData = new FormData()

    // file.forEach((file) => {
    formData.append('file', file)
    // })

    const result = await axios.post(`${BASE_API_URL}/receive`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return result?.data
  } catch (error) {
    console.error('Error on upload sheet', error?.response?.data?.message)
    return {
      message:
        error?.response?.data?.message || 'Erro ao subir planilha de variações.',
      error: true,
    }
  }
}

async function downloadImage(url) {
  try {
    const response = await axios.get(`${BASE_API_URL}/image-analyzer${url}`, {
      responseType: 'blob',
    })

    let mimeType

    if (url.endsWith('.pdf')) {
      mimeType = 'application/pdf'
    } else if (url.endsWith('.jpg')) {
      mimeType = 'image/jpg'
    } else if (url.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
    } else if (url.endsWith('.png')) {
      mimeType = 'image/png'
    } else {
      mimeType = 'application/octet-stream'
    }

    const blob = new Blob([response.data], { type: mimeType })
    const blobUrl = URL.createObjectURL(blob)

    const newWindow = window.open('', '_blank')
    if (!newWindow) {
      alert('Por favor, permita pop-ups para visualizar o arquivo!')
      return
    }

    let content
    if (mimeType.startsWith('image/')) {
      content = `
        <img 
          src="${blobUrl}" 
          style="max-width: 100%; max-height: 100%; object-fit: contain;" 
          onload="window.URL.revokeObjectURL('${blobUrl}')"
        >`
    } else if (mimeType === 'application/pdf') {
      content = `
        <embed 
          src="${blobUrl}" 
          type="application/pdf" 
          style="width: 100%; height: 100vh;" 
        >`
    } else {
      URL.revokeObjectURL(blobUrl)
      throw new Error('Tipo de arquivo não suportado')
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>Visualizador - ${mimeType}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px;
              background: #f0f0f0;
            }
            .container {
              max-width: 100%;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
      </html>
    `)

    newWindow.document.close()

    newWindow.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(blobUrl)
    })
  } catch (error) {
    console.error('Erro ao abrir arquivo:', error)
    alert(`Erro: ${error.message}`)
    return error
  }
}

async function downloadImageLikeBlob(url) {
  try {
    const response = await axios.get(`${BASE_API_URL}/image-analyzer${url}`, {
      responseType: 'blob',
    })

    let mimeType

    if (url.endsWith('.pdf')) {
      mimeType = 'application/pdf'
    } else if (url.endsWith('.jpg')) {
      mimeType = 'image/jpg'
    } else if (url.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
    } else if (url.endsWith('.png')) {
      mimeType = 'image/png'
    } else {
      mimeType = 'application/octet-stream'
    }

    const blob = new Blob([response.data], { type: mimeType })

    return blob
  } catch (error) {
    console.error('Erro ao abrir arquivo:', error)
    alert(`Erro: ${error.message}`)
    return error
  }
}

const downloadEvidencesZip = async (query) => {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()

    const response = await axios.get(`${BASE_API_URL}/reports/zip?${queryString}`, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'evidencias.zip')

    document.body.appendChild(link)

    link.click()

    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro:', error)
  }
}

async function getNewJob(jobId) {
  try {
    const result = await axios.get(`${BASE_API_URL}/reports/details/${jobId}`)
    return result?.data
  } catch (error) {
    console.error('Error on get new job', error)
    return error
  }
}

async function getReportList() {
  try {
    const result = await axios.get(`${BASE_API_URL}/reports/list`)
    return result?.data
  } catch (error) {
    console.error('Error on get new job', error)
    return error
  }
}

async function getAllReports(query) {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()

    const result = await axios.get(`${BASE_API_URL}/reports?${queryString}`)
    return result?.data
  } catch (error) {
    console.error('Error on get reports', error)
    return error
  }
}

async function updateReports(query, data) {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()

    const result = await axios.put(`${BASE_API_URL}/reports/update?${queryString}`, data)
    return result?.data
  } catch (error) {
    console.error('Error on update reports', error)
    return error
  }
}

async function getExcelOfReports(query, format = 'xlsx') {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()

    const response = await axios.get(`${BASE_API_URL}/reports/xlsx?${queryString}`, {
      responseType: 'blob',
      headers: {
        format: format,
      },
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reports.${format}`)

    document.body.appendChild(link)

    link.click()

    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error on get xlsx', error)
    return error
  }
}

async function getReportById(jobId) {
  try {
    const result = await axios.get(`${BASE_API_URL}/reports/report/${jobId}`)
    return result?.data
  } catch (error) {
    console.error('Error on get report by id', error)
    return error
  }
}

async function getAllSector() {
  try {
    const result = await axios.get(`${BASE_API_URL}/sectors`)
    return result?.data
  } catch (error) {
    console.error('Error on get report by id', error)
    return error
  }
}

async function getAllUnit() {
  try {
    const result = await axios.get(`${BASE_API_URL}/units`)
    return result?.data
  } catch (error) {
    console.error('Error on get report by id', error)
    return error
  }
}

async function checkUser() {
  try {
    const result = await axios.get(`${BASE_API_URL}/users/check-user`)
    return result?.data
  } catch (error) {
    console.error('Error on get report by id', error)
    return error
  }
}

async function listUsers() {
  try {
    const response = await axios.get(`${BASE_API_URL}/users/list`)
    return response.data
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function createNewUser(data) {
  try {
    const response = await axios.post(`${BASE_API_URL}/users/create`, data)
    return response.data
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function updateUser(data) {
  try {
    const response = await axios.put(`${BASE_API_URL}/users/update`, data)
    return response.data
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function deleteUser(query) {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()
    const response = await axios.delete(`${BASE_API_URL}/users/delete?${queryString}`)
    return response.data
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function getExcelExamplePeople() {
  try {
    const response = await axios.get(`${BASE_API_URL}/people/example`, {
      responseType: 'blob',
      headers: {
        format: 'xlsx',
      },
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Exemplo-planilha-de-pessoas.xlsx`)

    document.body.appendChild(link)

    link.click()

    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error on get xlsx', error)
    return error
  }
}

async function createReportOnExistentJobId(data) {
  try {
    const response = await axios.post(`${BASE_API_URL}/reports/add_row`, data)
    return response.data
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function removeReportByIds(data) {
  try {
    const response = await axios.post(`${BASE_API_URL}/reports/remove_rows`, data)
  } catch (err) {
    console.error('Erro on get user list', err)
    return err
  }
}

async function getVariations() {
  try {
    const response = await axios.get(`${BASE_API_URL}/variations`)
    return response?.data
  } catch (error) {
    console.error('Error on get variations', error)
    return error
  }
}

async function getExcelOfVariations(query, format = 'xlsx') {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()

    const response = await axios.get(`${BASE_API_URL}/variations/xlsx?${queryString}`, {
      responseType: 'blob',
      headers: {
        format: format,
      },
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Variations.${format}`)

    document.body.appendChild(link)

    link.click()

    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error on get Variations xlsx', error)
    return error
  }
}

async function getPdfExampleReport(query) {
  try {
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(filteredQuery).toString()
    const response = await axios.get(`${BASE_API_URL}/reports/example?${queryString}`, {
      responseType: 'blob',
      // headers: {
      //   format: 'pdf',
      // },
    })

    // const url = window.URL.createObjectURL(new Blob([response.data]))

    // const link = document.createElement('a')
    // link.href = url
    // link.setAttribute('download', `Exemplo-planilha-de-pessoas.xlsx`)

    // document.body.appendChild(link)

    // link.click()

    // link.parentNode.removeChild(link)
    // window.URL.revokeObjectURL(url)

    let mimeType

    // if (url.endsWith('.pdf')) {
    mimeType = 'application/pdf'
    // } else if (url.endsWith('.jpg')) {
    //   mimeType = 'image/jpg'
    // } else if (url.endsWith('.jpeg')) {
    //   mimeType = 'image/jpeg'
    // } else if (url.endsWith('.png')) {
    //   mimeType = 'image/png'
    // } else {
    //   mimeType = 'application/octet-stream'
    // }

    const blob = new Blob([response.data], { type: mimeType })
    const blobUrl = URL.createObjectURL(blob)

    const newWindow = window.open('', '_blank')
    if (!newWindow) {
      alert('Por favor, permita pop-ups para visualizar o arquivo!')
      return
    }

    let content
    // if (mimeType.startsWith('image/')) {
    //   content = `
    //     <img
    //       src="${blobUrl}"
    //       style="max-width: 100%; max-height: 100%; object-fit: contain;"
    //       onload="window.URL.revokeObjectURL('${blobUrl}')"
    //     >`
    // } else if (mimeType === 'application/pdf') {
    content = `
        <embed 
          src="${blobUrl}" 
          type="application/pdf" 
          style="width: 100%; height: 100vh;" 
        >`
    // } else {
    //   URL.revokeObjectURL(blobUrl)
    //   throw new Error('Tipo de arquivo não suportado')
    // }

    newWindow.document.write(`
      <html>
        <head>
          <title>Visualizador - ${mimeType}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px;
              background: #f0f0f0;
            }
            .container {
              max-width: 100%;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
      </html>
    `)

    newWindow.document.close()

    newWindow.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(blobUrl)
    })
  } catch (error) {
    console.error('Error on get xlsx', error)
    return error
  }
}

// const fetchVariationDetails = async (id) => {
  // const variant = await axios.get(`https://www.lojagtsm1.com.br/web_api/variants?id=${id}`);
  // if (variant?.data) {
    // return variant.data?.Variants?.[0]?.Variant
  // }
  // return `https://www.lojagtsm1.com.br/bicicletas/fat-i-vtec-tsi7-freio-a-disco-hidraulico-7v-color?opencode_theme=67e6f507-2e5c-484d-8212-14adc0a8044e&variant_id=${id}`;
  // return `https://www.lojagtsm1.com.br/bicicletas/fat-i-vtec-tsi7-freio-a-disco-hidraulico-7v-color?variant_id=${id}`;
// }

export {
  checkUser,
  createNewUser,
  createReportOnExistentJobId,
  deleteUser,
  downloadEvidencesZip,
  downloadImage,
  downloadImageLikeBlob,
  getAllReports,
  getAllSector,
  getAllUnit,
  getExcelExamplePeople, getExcelOfReports, getExcelOfVariations, getNewJob,
  getPdfExampleReport,
  getReportById,
  getReportList, getVariations, listUsers,
  loginApi,
  removeReportByIds,
  updateReports,
  updateUser,
  uploadImage,
  uploadPlanilha,
  // fetchVariationDetails
}

