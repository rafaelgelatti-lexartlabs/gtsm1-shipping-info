import 'core-js'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import store from './store'

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then((registration) => {
//         console.log('Service Worker registrado con éxito:', registration)
//       })
//       .catch((error) => {
//         console.log('Error en el registro del Service Worker:', error)
//       })
//   })
// }

// const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_WEB_KEY

createRoot(document.getElementById('root')).render(
  // <GoogleReCaptchaProvider
  //   reCaptchaKey={RECAPTCHA_KEY}
  //   useEnterprise={true}
  //   scriptProps={{
  //     async: false,
  //     defer: false,
  //     appendTo: 'head',
  //     nonce: undefined,
  //   }}
  // >
  <Provider store={store}>
    <App />
  </Provider>
  // </GoogleReCaptchaProvider>,
)
