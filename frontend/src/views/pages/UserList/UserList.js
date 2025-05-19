import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import { PiEye, PiEyeClosed } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'
import CreatableSelect from 'react-select/creatable'
import '../../../scss/views/pages/UserList/UserList.scss'
import {
  createNewUser,
  deleteUser,
  getAllUnit,
  listUsers,
  updateUser,
} from '../../../utils/fetchApi'
import { getDataInStorage, saveDataInStorage } from '../../../utils/localstorage'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [units, setUnits] = useState([])
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    unidad: '',
    password: '',
    confirmPassword: '',
    type: 'OPERADOR',
  })
  const navigate = useNavigate()

  const validatePassword = (password) => {
    if (password.length < 12) {
      return 'A senha deve ter pelo menos 12 caracteres'
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula'
    }
    if (!/[a-z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula'
    }
    if (!/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos um número'
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'A senha deve conter pelo menos um caractere especial'
    }
    return ''
  }

  const fetchUnits = async () => {
    const allUnits = (await getAllUnit()).data
    setUnits(
      allUnits.map((e) => ({
        value: e?.name,
        label: e?.name,
      })),
    )
  }

  const fetchUsers = async () => {
    try {
      const response = await listUsers()

      const actualUser = getDataInStorage('user')

      // if (response?.response?.statusText === 'Unauthorized') {
      //   actualUser.type = 'OPERADOR'
      //   actualUser.password = undefined
      //   saveDataInStorage('user', actualUser)
      //   return navigate('/')
      // }

      const serverUser = response.find((user) => user.id === actualUser.id)
      serverUser.password = undefined
      if (JSON.stringify(actualUser) !== JSON.stringify(serverUser)) {
        saveDataInStorage('user', serverUser)
      }
      await fetchUnits()

      setUsers(response)
      setLoading(false)
    } catch (err) {
      // navigate('/')
      setError('Erro ao buscar usuários')
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    try {
      setLoading(true)
      const responseUser = await createNewUser(formData)
      if (responseUser?.response?.data.error || responseUser?.error) {
        setLoading(false)
        setModalVisible(false)
        setFormData({
          username: '',
          email: '',
          unidad: '',
          password: '',
          confirmPassword: '',
          type: 'OPERADOR',
        })
        setError(responseUser?.response?.data?.message || responseUser?.message)
        return
      }

      setModalVisible(false)
      setFormData({
        username: '',
        email: '',
        unidad: '',
        password: '',
        confirmPassword: '',
        type: 'OPERADOR',
      })
      await fetchUsers()
    } catch (err) {
      setError('Erro ao criar usuário')
    }
  }

  const handleUpdateUser = async () => {
    if (formData.password) {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        setError(passwordError)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        return
      }
    }

    try {
      setLoading(true)
      const responseUser = await updateUser({
        ...formData,
        id: selectedUser.id,
      })

      if (responseUser?.response?.data.error || responseUser?.error) {
        setLoading(false)
        setEditModalVisible(false)
        setModalVisible(false)
        setFormData({
          username: '',
          email: '',
          unidad: '',
          password: '',
          confirmPassword: '',
          type: 'OPERADOR',
        })
        setError(responseUser?.response?.data?.message || responseUser?.message)
        return
      }

      setEditModalVisible(false)
      await fetchUsers()
    } catch (err) {
      setError('Erro ao atualizar usuário')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser({ id: userId })
        await fetchUsers()
      } catch (err) {
        setError('Erro ao excluir usuário')
      }
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      unidad: user?.unidad,
      password: '',
      confirmPassword: '',
      type: user.type,
    })
    setEditModalVisible(true)
  }

  const columns = [
    { key: 'username', label: 'Nome de Usuário' },
    { key: 'unidad', label: 'Unidade' },
    { key: 'email', label: 'E-mail' },
    { key: 'type', label: 'Tipo' },
    {
      key: 'actions',
      label: 'Ações',
      filter: false,
      sorter: false,
      _style: { width: '20%' },
    },
  ]

  useEffect(() => {
    if (error === '') return
    setTimeout(() => {
      setError('')
    }, 3000)
  }, [error])

  useEffect(() => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(getDataInStorage('user').type)) {
      navigate('/upload-pausa')
    }
    fetchUsers()
  }, [])

  if (loading)
    return (
      <CCol>
        <CSpinner /> Carregando...
      </CCol>
    )
  // if (error) return <CCol>{error}</CCol>

  return (
    <>
      {error && <CAlert color="danger">{error}</CAlert>}
      <CCol>
        <div className="mb-3">
          <CButton
            color="primary"
            onClick={async () => {
              setFormData({
                username: '',
                email: '',
                unidad: '',
                password: '',
                confirmPassword: '',
                type: 'OPERADOR',
              })
              setModalVisible(true)
            }}
          >
            Novo Usuário
          </CButton>
        </div>

        <CTable
          items={users.map((user) => ({
            ...user,
            type: user.type.replace('SUPER_ADMIN', 'ADMIN'),
            actions: (
              <div>
                <CButton color="primary" className="me-2" onClick={() => openEditModal(user)}>
                  Editar
                </CButton>
                <CButton
                  disabled={getDataInStorage('user').id === user.id}
                  style={{
                    border: '1px var(--cui-primary) solid',
                    color: 'var(--cui-primary)',
                  }}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Excluir
                </CButton>
              </div>
            ),
          }))}
          columns={columns}
          responsive
        />

        {/* Modal de Criação */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Criar Novo Usuário</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                label="Nome de Usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mb-3"
                autoComplete="new-username"
                id="unique-username-id"
              />
              <CFormInput
                type="email"
                label="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="off"
                className="mb-3"
                id="unique-email-id"
              />
              <CFormLabel>Tipo de Usuário</CFormLabel>
              <CreatableSelect
                className="mb-3"
                isSearchable
                placeholder="Selecione um tipo"
                name="type"
                // value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.value })}
                options={[
                  { label: 'Administrador', value: 'ADMIN' },
                  { label: 'Operador', value: 'OPERADOR' },
                ]}
              />
              <CFormLabel>Unidade</CFormLabel>
              <CreatableSelect
                options={units}
                styles={{ order: '0' }}
                isClearable
                className="mb-3"
                name="unidad"
                onChange={({ value }) => {
                  setFormData({ ...formData, unidad: value })
                }}
                isSearchable
                placeholder="Selecione uma unidade"
              />
              <div className="mb-3">
                <label className="form-label">Senha</label>
                <CInputGroup>
                  <CFormInput
                    type={showCreatePassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    id="unique-password-id"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <CInputGroupText>
                    <CButton
                      variant="outline"
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? <PiEye style={{ order: 0 }} /> : <PiEyeClosed />}
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
                <small className="form-text text-muted">
                  A senha deve conter:
                  <ul>
                    <li>Mínimo 12 caracteres</li>
                    <li>Pelo menos 1 letra maiúscula</li>
                    <li>Pelo menos 1 letra minúscula</li>
                    <li>Pelo menos 1 número</li>
                    <li>Pelo menos 1 caractere especial</li>
                  </ul>
                </small>
              </div>

              {/* Campo de Confirmação de Senha */}
              <div className="mb-3">
                <label className="form-label">Confirmar Senha</label>
                <CInputGroup>
                  <CFormInput
                    type={showCreatePassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    autoComplete="new-password"
                    id="unique-confirm-password-id"
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <CInputGroupText>
                    <CButton
                      variant="outline"
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? <PiEye /> : <PiEyeClosed />}
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
              </div>
            </CForm>
            {error && <div className="text-danger mt-2">{error}</div>}
          </CModalBody>
          <CModalFooter>
            <CButton
              style={{
                border: '1px var(--cui-primary) solid',
                color: 'var(--cui-primary)',
              }}
              onClick={() => setModalVisible(false)}
            >
              Cancelar
            </CButton>
            <CButton
              color="primary"
              disabled={
                Object.values(formData).includes('') ||
                formData.password !== formData.confirmPassword
              }
              onClick={handleCreateUser}
            >
              Criar Usuário
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal de Edição */}
        <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Editar Usuário</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                label="Nome de Usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mb-3"
              />
              <CFormInput
                type="email"
                label="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mb-3"
              />
              {formData.type !== 'SUPER_ADMIN' && (
                <>
                  <CFormLabel>Tipo de Usuário</CFormLabel>
                  <CreatableSelect
                    className="mb-3"
                    isSearchable
                    placeholder="Selecione um tipo"
                    name="type"
                    // value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.value })}
                    options={[
                      { label: 'Administrador', value: 'ADMIN' },
                      { label: 'Operador', value: 'OPERADOR' },
                    ]}
                  />
                </>
              )}
              <CFormLabel>Unidade</CFormLabel>
              <CreatableSelect
                options={units}
                isClearable
                className="mb-3"
                name="unidad"
                onChange={({ value }) => {
                  setFormData({ ...formData, unidad: value })
                }}
                isSearchable
                placeholder="Selecione uma unidade"
              />
              <div className="mb-3">
                <label className="form-label">Nova Senha (deixe em branco para manter)</label>
                <CInputGroup>
                  <CFormInput
                    type={showEditPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <CInputGroupText>
                    <CButton
                      variant="outline"
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? <PiEye /> : <PiEyeClosed />}
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
                <small className="form-text text-muted">
                  Deixe em branco para manter a senha atual. Nova senha deve conter:
                  <ul>
                    <li>Mínimo 12 caracteres</li>
                    <li>Pelo menos 1 letra maiúscula</li>
                    <li>Pelo menos 1 letra minúscula</li>
                    <li>Pelo menos 1 número</li>
                    <li>Pelo menos 1 caractere especial</li>
                  </ul>
                </small>
              </div>

              {/* Campo de Confirmação de Nova Senha */}
              <div className="mb-3">
                <label className="form-label">Confirmar Nova Senha</label>
                <CInputGroup>
                  <CFormInput
                    type={showEditPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <CInputGroupText>
                    <CButton
                      variant="outline"
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? <PiEye /> : <PiEyeClosed />}
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
              </div>
            </CForm>
            {error && <div className="text-danger mt-2">{error}</div>}
          </CModalBody>
          <CModalFooter>
            <CButton
              style={{
                border: '1px var(--cui-primary) solid',
                color: 'var(--cui-primary)',
              }}
              onClick={() => setEditModalVisible(false)}
            >
              Cancelar
            </CButton>
            <CButton color="primary" onClick={handleUpdateUser}>
              Salvar Alterações
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </>
  )
}
export default UserList
