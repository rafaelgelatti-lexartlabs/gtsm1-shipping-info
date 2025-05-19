const capitalize = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

const getrandomvalues = (length = 13) => {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyz'
  const randomValues = new Uint8Array(length)
  window.crypto.getRandomValues(randomValues)
  return Array.from(randomValues, (byte) => charset[byte % charset.length]).join('')
}

export { capitalize, getrandomvalues }
