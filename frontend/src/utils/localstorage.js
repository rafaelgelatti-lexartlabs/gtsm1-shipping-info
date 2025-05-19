function saveAccessTokenInStorage(token) {
  // localStorage.setItem('session', JSON.stringify({ token }))
  sessionStorage.setItem('session', JSON.stringify({ token }))
}

function getTokenInStorage() {
  const sessionData = sessionStorage.getItem('session')
  return sessionData ? JSON.parse(sessionData) : null
}

function saveDataInStorage(key, value) {
  // localStorage.setItem(key, JSON.stringify(value))
  sessionStorage.setItem(key, JSON.stringify(value))
}

function getDataInStorage(key) {
  // const data = localStorage.getItem(key)
  const data = sessionStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

function removeKeyInStorage(key) {
  // localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

function clearStorage() {
  // localStorage.clear()
  sessionStorage.clear()
}

export {
  clearStorage,
  getDataInStorage,
  getTokenInStorage,
  removeKeyInStorage,
  saveAccessTokenInStorage,
  saveDataInStorage,
}
