import { io } from 'socket.io-client'
import { getrandomvalues } from '../utils/utils'

class WebSocketService {
  constructor() {
    this.socket = null
    this.pendingRequests = new Map()
    this.messageHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.eventQueue = []
  }

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      console.log(`Connecting to: ${url}`)
      this.socket = io(url, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 3000,
        transports: ['websocket'],
      })

      this.socket.on('connect', () => {
        console.log('Socket.IO connected')
        this.reconnectAttempts = 0
        this.flushEventQueue()
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${reason}`)
      })

      this.socket.on('message', (message) => {
        this.handleMessage(message)
      })

      this.socket.onAny((event, ...args) => {
        console.log('Evento recebido:', event, args)
        if (this.messageHandlers.has(event)) {
          this.messageHandlers.get(event)(args[0])
        }
      })
    })
  }

  flushEventQueue() {
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()
      this.socket.emit(event, data)
    }
  }

  handleMessage(message) {
    console.log('Mensagem recebida:', message)
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const { resolve, reject } = this.pendingRequests.get(message.requestId)
      if (message.error) {
        reject(message.error)
      } else {
        resolve(message.data)
      }
      this.pendingRequests.delete(message.requestId)
    }

    if (message.type && this.messageHandlers.has(message.type)) {
      this.messageHandlers.get(message.type)(message.data)
    }
  }

  sendMessage(type, data) {
    console.log('Enviando mensagem:', type, data)
    return new Promise((resolve, reject) => {
      if (/* !this.socket.active || */ !this.socket.connected /* !== WebSocket.OPEN */) {
        reject(new Error('WebSocket connection not established'))
        return
      }

      const requestId = getrandomvalues()

      this.pendingRequests.set(requestId, { resolve, reject })

      const message = {
        type,
        requestId,
        data,
      }

      this.socket.send(message)
    })
  }

  registerHandler(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.pendingRequests.clear()
    }
  }
}

const webSocketService = WebSocketService.getInstance()
export default webSocketService
