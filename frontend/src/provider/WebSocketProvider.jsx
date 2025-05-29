// import { useEffect } from 'react'
// import webSocketService from '../services/websocket.service'

// const WebSocketProvider = ({ children }) => {
//   useEffect(() => {
//     const connectWebSocket = async () => {
//       try {
//         await webSocketService.connect(import.meta.env.VITE_PUBLIC_API_URL)
//       } catch (error) {
//         console.error('WebSocket connection failed:', error)
//       }
//     }

//     connectWebSocket()

//     return () => {
//       webSocketService.disconnect()
//     }
//   }, [])

//   return children
// }

// export default WebSocketProvider
